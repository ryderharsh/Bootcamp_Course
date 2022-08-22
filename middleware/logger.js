
const logger = (req,res,next) => {
    //req.hello = "Hello Express"
    console.log(`${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`)
    next()
}


module.exports = logger