const express = require("express")
const router = express.Router()
const { 
    getBootcampsByDomain,
    getBootcamps,
    getBootcamp,
    createBootcamps,
    updateBootcamps,
    deleteBootcamps, 
    getBootcampsByCity,
    bootcampPhotoUpload} =  require("../controllers/bootcamps")

const Bootcamp = require("../models/Bootcamp") 
const advanceResults = require("../middleware/advanceResults")    

const dietRouter = require("./diet")
const reviewRouter = require("./review")
const { protect, authorize } = require("../middleware/auth")

router.use("/:bootcampId/diet", dietRouter)
router.use("/:bootcampId/review", reviewRouter)

router.route("/:id/photo").put(protect,authorize("MD","MRCP"), bootcampPhotoUpload)

router
.route("/")
.get(advanceResults(Bootcamp, "diet"),getBootcamps)
.post(protect,authorize("MD","MRCP"),createBootcamps)

// router.route("/getAgensalary")
// .get(getAgensalary)

router.route("/:id")
.get(getBootcamp)
.put(protect,authorize("MD","MRCP"), updateBootcamps)
.delete(protect,authorize("MD","MRCP"), deleteBootcamps)

router.route("/searchdomain/:domain")
.get(getBootcampsByDomain)

router.route("/searchcity/:city")
.get(getBootcampsByCity)

module.exports = router