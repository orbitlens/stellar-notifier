const config = require('../models/config'),
    storage = require('../logic/storage'),
    roles = require('../models/user/roles'),
    signing = require('../util/signing')

const scheme = 'ed25519 '

function authError(res, details) {
    return res.status(401).json({
        error: details
    })
}

function _getDefaultAdmin() {
    return {
        pubkey: null,
        roles: [roles.ADMIN]
    }
}

function unauthorized(res) {
    res.status(401).json({
        error: 'Unauthorized'
    })
}

function forbidden(res) {
    res.status(403).json({
        error: 'Forbidden'
    })
}

function isInRole(req, role) {
    return req.user && req.user.roles && req.user.roles.indexOf(role) >= 0
}

function canEdit(req, resourceOwnerPubKey) {
    return req.user && (isInRole(req, roles.ADMIN) || req.user.pubkey === resourceOwnerPubKey)
}

function userMiddleware(req, res, next) {
    req.user = null
    let promise = Promise.resolve()
    if (!config.authorization || config.authorization === 'disabled') {
        req.user = _getDefaultAdmin()
    } else {
        let token = req.headers['x-access-token'] || req.headers['authorization']
        if (token && token.startsWith(scheme)) {
            token = token.slice(scheme.length, token.length)
        }

        if (config.adminAuthenticationToken && token === config.adminAuthenticationToken) {
            req.user = _getDefaultAdmin()
        } else if (token) {
            const [pubkey, signature] = token.split('.')

            let payload = JSON.stringify(req.body),
                nonce = Number(req.body.nonce)
            if (req.method === 'GET') {
                nonce = Number(req.params.nonce || req.query.nonce)
                payload = nonce.toString()
            }

            if (nonce && !isNaN(nonce) && payload) {
                const _signing = new signing(pubkey)
                if (_signing.verify(payload, signature)) {
                    let userProvider = storage.provider.userProvider
                    promise = userProvider.getUserByPublicKey(pubkey)
                        .then(user => {
                            if (user)
                                return user
                            return userProvider.addUser({
                                    pubkey,
                                    roles: []
                                })
                                .then(() => {
                                    return userProvider.getUserByPublicKey(pubkey)
                                })
                        })
                        .then(user => {
                            if (user && user.nonce < nonce) {
                                return userProvider.updateNonce(user.id, nonce)
                                    .then(res => {
                                        if (res)
                                            req.user = {
                                                pubkey: user.pubkey,
                                                roles: user.roles
                                            }
                                        return Promise.resolve()
                                    })
                            }
                            return Promise.resolve()
                        })
                }
            }
        }
    }
    promise.then(() => next())
}

function userRequiredMiddleware(req, res, next) {
    if (!req.user)
        return unauthorized(res)
    else
        next()
}

function isInRoleMiddleware(role) {
    return function (req, res, next) {
        if (!req.user || req.user.roles.indexOf(role) === -1)
            return forbidden(res)
        else
            next()
    }
}

module.exports = {
    userMiddleware,
    userRequiredMiddleware,
    isInRoleMiddleware,
    canEdit,
    unauthorized,
    forbidden,
    isInRole
}