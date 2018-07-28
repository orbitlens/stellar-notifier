
const env = (key, defaultValue) => {
  const value = process.env[key] || defaultValue

  if (typeof defaultValue === 'number') {
    return parseInt(value)
  }

  return value
}

module.exports = {
  authorization: env('AUTHORIZATION', 'disabled'),
  storageProvider: env('STORAGE_PROVIDER', 'memory'),
  storageConnectionString: env('STORAGE_CONNECTION_STRING', ''),
  apiPort: env('API_PORT', 4021),
  horizon: env('HORIZON', 'https://horizon.stellar.org'),
  signatureSecret: env('SIGNATURE_SECRET',  'SDBT736EJIIRDC3RSN544NO6OSNMZAWAKRARLOMRP2XJAOGKTQLFFR3V'),
  maxActiveSubscriptions: env('MAX_ACTIVE_SUBSCRIPTIONS', 10000),
  notificationConcurrency: env('NOTIFICATION_CONCURRENCY', 100),
  reactionResponseTimeout: env('REACTION_RESPONSE_TIMEOUT', 20),
  adminAuthenticationToken: env('ADMIN_AUTHENTICATION_TOKEN', '98c12910bf35c79a800e9ea893a93b078ea92fc7a26ca76c0cd2f6003464d781'),
}
