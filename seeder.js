const fs = require("fs")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const Bootcamp = require("./models/Bootcamp")
const Diet = require("./models/Diet")
const Doctor = require("./models/Doctor")
const Review = require("./models/Review")

dotenv.config({Path: "./.env"})
mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
const bootcamp = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/bootcamp.json`, "utf-8")
 )
 const diet = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/diet.json`, "utf-8")
 )
 const doctor = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/doctor.json`, "utf-8")
 )
 const review = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/review.json`, "utf-8")
 )
 
const importData = async () => {
    try{
        await Bootcamp.create(bootcamp)
        await Diet.create(diet)
        await Doctor.create(doctor)
        await Review.create(review)
        console.log("Bootcamp Imported")
        console.log("Diet Imported")
        console.log("Doctor Imported")
        console.log("Review Imported")
        process.exit()
    }catch(err){
        console.error(err)
    }
}

const deleteData = async () => {
    try{
        await Bootcamp.deleteMany()
        await Diet.deleteMany()
        await Doctor.deleteMany()
        await Review.deleteMany()
        console.log("Data Deleted")
        process.exit()
    }catch(err){
        console.error(err)
    }
}
 
if(process.argv[2] === "-i"){
    console.log("Started Please Wait!")
    importData()
 }else if (process.argv[2] === "-d"){
    console.log("Started Please Wait!")
    deleteData()
 }