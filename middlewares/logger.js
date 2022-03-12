// @disc    logs requests to console
let logger = (req, res, next) => {
    console.log(`From middleware 😎: ${req.method}: ${req.protocol}://${req.get('host')}${req.originalUrl}`)
    next();
}


module.exports = logger;