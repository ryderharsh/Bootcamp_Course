const Review = require("../models/Review")
const Bootcamp = require("../models/Bootcamp")
const ErrorResponse = require("../utils/errorResponse")

exports.getReview = async (req,res,next) => {
    if(req.params.bootcampId) {
          const review = await Review.find({ client: req.params.bootcampId })
          return res.status(200).json({
              success: true,
              count: review.length,
              data: review
          })
      }else {
          res.status(200).json(res.advanceResults)
      }
  }

  exports.getSingleReview = async (req,res,next) => {
          const review = await Review.findById(req.params.id).populate({
            path: "client",
            select: "name descrip"
          })
          if(!review) {
            return next(
                new ErrorResponse(`No review found with the id of ${req.params.id}`),404)
          }else{
            res.status(200).json({
                success: true,
                data: review
            })
          }
  }

exports.addReview = async (req,res,next) => {
    req.body.client = req.params.bootcampId
    req.body.doctor = req.doctor.id
    const bootcamp = await Bootcamp.findById(req.params.bootcampId)
    if(!bootcamp){
        return next(
            new ErrorResponse(
                `No bootcamp with the id of ${req.params.bootcampId}`,404)
        )
    }
    const review  = await Review.create(req.body)

   res.status(201).json({
          success: true,
          data: review
      })
    
}

exports.updateReview = async (req,res,next) => {
    let review = await Review.findById(req.params.id)
    if(!review){
        return next(
            new ErrorResponse(
                `No review with the id of ${req.params.id}`,404)
        )
    }
    if(review.doctor.toString() !== req.doctor.id && req.doctor.role !== "MRCP"){
        return next(
            new ErrorResponse(
                `Not authorized to update review`,401
            )
        )
    }
    review  = await Review.findByIdAndUpdate(req.params.id, req.body,{
        new: true,
        runValidators: true
    })

   res.status(201).json({
          success: true,
          data: review
      })
    
}

exports.deleteReview = async (req,res,next) => {
    const review = await Review.findById(req.params.id)
    if(!review){
        return next(
            new ErrorResponse(
                `No review with the id of ${req.params.id}`,404)
        )
    }
    if(review.doctor.toString() !== req.doctor.id && req.doctor.role !== "MRCP"){
        return next(
            new ErrorResponse(
                `Not authorized to update review`,401
            )
        )
    }
    await review.remove()
   res.status(201).json({
          success: true,
          data: {}
      })
    
}

