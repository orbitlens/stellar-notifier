process.env.NODE_ENV = process.env.NODE_ENV || 'production'

function init() {
    const config = require('./models/config')
    //init storage and persistence layer
    const storage = require('./logic/storage')
    return storage.init(config)
        .then(() => {
            //init and start observer
            const observer = require('./logic/observer')
            observer.start()
            
            //init HTTP server and map all API routes
            const server = require('./api/server-initialization')(config)

            return server
        })
}

module.exports = init()