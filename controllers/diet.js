const Diet = require("../models/Diet")
const Bootcamp = require("../models/Bootcamp")
const ErrorResponse = require("../utils/errorResponse")

exports.getDiet = async (req,res,next) => {
  if(req.params.bootcampId) {
        const diets = await Diet.find({ client: req.params.bootcampId })
        return res.status(200).json({
            success: true,
            count: diets.length,
            data: diets
        })
    }else {
        res.status(200).json(res.advanceResults)
    }
}

exports.getSingleDiet = async (req,res,next) => {
   const diet = await Diet.findById(req.params.id).populate({
    path: "client",
    select: "name email"
   })
   if(!diet){
    return next(
        new ErrorResponse(`No diet with the id of ${req.params.id}`),
        404
    )
   }
   
   res.status(200).json({
        success: true,
        data: diet
    })
}

exports.addDiet = async (req,res,next) => {
    req.body.client = req.params.bootcampId;
    req.body.doctor = req.doctor.id

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)
   if(!bootcamp){
     return next(
         new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`),
         404
     )
    }
//Make sure user is diet owner
if (bootcamp.doctor.toString() !== req.doctor.id && req.doctor.role !== "MRCP") {
    return next(
      new ErrorResponse(
    `Doctor ${req.doctor.id} is not authorized to add a course to bootcamp ${bootcamp._id}`,
     401)
    )
  }
    const diet = await Diet.create(req.body)
    
    res.status(200).json({
         success: true,
         data: diet
     })
 }

 exports.updateDiet = async (req,res,next) => {
    let diet = await Diet.findById(req.params.id)
   if(!diet){
     return next(
         new ErrorResponse(`No diet with the id of ${req.params.id}`),
         404
     )
    }
//Make sure user is course owner
if (diet.doctor.toString() !== req.doctor.id && req.doctor.role !== "MRCP") {
    return next(
    new ErrorResponse(
    `Doctor ${req.doctor.id} is not authorized to update course ${diet._id}`,
     401)
    )
  }
    diet = await Diet.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    } )
    
    res.status(200).json({
         success: true,
         data: diet
     })
 }

 exports.deleteDiet = async (req,res,next) => {
    const diet = await Diet.findById(req.params.id)
   if(!diet){
     return next(
         new ErrorResponse(`No diet with the id of ${req.params.id}`),
         404
     )
    }
//Make sure user is course owner
if (diet.doctor.toString() !== req.doctor.id && req.doctor.role !== "MRCP") {
    return next(
    new ErrorResponse(
    `Doctor ${req.doctor.id} is not authorized to delete course ${diet._id}`,
     401)
    )
  }
    await diet.remove()

    res.status(200).json({
         success: true,
         data: {}
     })
 }