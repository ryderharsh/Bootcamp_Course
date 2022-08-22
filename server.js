const express = require("express")
const dotenv = require("dotenv")
const morgan = require("morgan")
const path = require("path");
const fileupload = require("express-fileupload")
const connectDB =  require("./db")
const errorHandler = require("./middleware/error")
const cookieParser = require("cookie-parser")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const hpp = require("hpp")
const xss = require("xss-clean")
const cors = require("cors")
const bootcamps = require("./routes/bootcamp")
const diet = require("./routes/diet")
const doctor = require("./routes/doctor")
const docurd = require("./routes/docurd")
const review = require("./routes/review")
const mongoSanitize = require("express-mongo-sanitize")
//Load env vars
dotenv.config({ path: "./.env"})
//Connect Database
connectDB()
const app = express()
//Body Parser
app.use(express.json())

//Cookie Parser
app.use(cookieParser())
//Dev logging middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}
//File Upload
app.use(fileupload());

//Sanitize data
app.use(mongoSanitize())

//Set Security headers
app.use(helmet())

//Prevent XSS attacks
app.use(xss())

//Rate limiting
const limiter = rateLimit({
    WindowMs: 10 * 60 * 1000, //10 mins
    max: 100
})
app.use(limiter)

//Prevent http param pollution
app.use(hpp())

//Enable CORS
app.use(cors())

//Set static folder
app.use(express.static(path.join(__dirname, "public")))

//Mount Routers
app.use("/api/v1/bootcamps",bootcamps)
app.use("/api/v1/diet",diet)
app.use("/api/v1/doctor",doctor)
app.use("/api/v1/docurd",docurd)
app.use("/api/v1/review",review)

app.use(errorHandler)

const PORT = process.env.PORT || 8080
const server = app.listen(
    PORT, 
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
    )

    process.on("unhandledRejection", (err, Promise) =>{
        console.log(`Unhandled Error ${err.message}`)
        server.close(() => process.exit(1))
    })