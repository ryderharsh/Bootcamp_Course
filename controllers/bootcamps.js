const Bootcamp = require("../models/Bootcamp");
const path = require("path");
const ErrorResponse = require("../utils/errorResponse");

exports.getBootcamps = async (req, res, next) => {
  res.status(200).json(res.advanceResults)
};
exports.getBootcamp = (req, res, next) => {
  Bootcamp.findById(req.params.id)
    .then((data) => {
      if (!data) {
        return next(
          new ErrorResponse(
            `Bootcamp not found with the id ${req.params.id}`,
            404
          )
        );
      }
      res.status = 200;
      res.json({ sucess: true, data: data, status: 201 });
    })
    .catch((err) => {
      //res.status= 400
      //res.json({ success: false, msg: err, status: 401})
      next(err);
    });
};
exports.getBootcampsByDomain = (req, res, next) => {
  Bootcamp.find({ email: { $regex: req.params.domain } })
    .then((data) => {
      res.status = 200;
      res.json({ sucess: true, data: data, count: data.length, status: 201 });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getBootcampsByCity = (req, res, next) => {
  Bootcamp.find({ address: { $regex: req.params.city } })
    .then((data) => {
      res.status = 200;
      res.json({ sucess: true, data: data, count: data.length, status: 201 });
    })
    .catch((err) => {
      next(err);
    });
};

exports.createBootcamps = async(req, res, next) => {
  //Add doctor to req.body
  req.body.doctor = req.doctor.id;
//Check for published bootcamp
const publishedBootcamp = await Bootcamp.findOne({ doctor: req.doctor.id})
//IF the doctor is not an MRCP, they can only add one bootcamp
if(publishedBootcamp && req.doctor.role !== "MRCP"){
  return next(new ErrorResponse(`The doctor with ID ${req.doctor.id} has already published a bootcamp`,400))
}
  const bootcamp = await Bootcamp.create(req.body)
      res.status(201).json({
      sucess: true, data: bootcamp})
};


exports.updateBootcamps = async (req, res, next) => {
  let data = await Bootcamp.findById(req.params.id)
    if (!data) {
        return next(
          new ErrorResponse(
            `Bootcamp not found with the id ${req.params.id}`,
            404
          )
        );
      }
//Make sure user is bootcamp owner
if (data.doctor.toString() !== req.doctor.id && req.doctor.role !== "MRCP") {
  return next(
    new ErrorResponse(`Doctor ${req.params.id} is not authorized to update this bootcamp`, 401)
  )
}
data = await Bootcamp.findOneAndUpdate(req.params.id, req.body, {
  new: true,
  runValidators: true
})
res.status(200).json({ success: true, data: data })
}


exports.deleteBootcamps = async (req, res, next) => {
  const data = await Bootcamp.findById(req.params.id);
  if (!data) {
    return next(
      new ErrorResponse(`Bootcamp not found with the id ${req.params.id}`, 404)
    );
  }
  if (data.doctor.toString() !== req.doctor.id && req.doctor.role !== "MRCP") {
    return next(
      new ErrorResponse(`Doctor ${req.params.id} is not authorized to delete this bootcamp`, 401)
    )
  }
  data.remove();
  res.status(200).json({ sucess: true, data: {} });
};

exports.bootcampPhotoUpload = async (req, res, next) => {
  const data = await Bootcamp.findById(req.params.id);
  if (!data) {
    return next(
      new ErrorResponse(`Bootcamp not found with the id ${req.params.id}`, 404)
    );
  }
  //Make sure user is bootcamp owner
if (data.doctor.toString() !== req.doctor.id && req.doctor.role !== "MRCP") {
  return next(
    new ErrorResponse(`Doctor ${req.params.id} is not authorized to update this bootcamp`, 401)
  )
}
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }
//   console.log(req.files)
  const file = req.files.file
  if(!file.mimetype.startsWith("image")){
      return next(new ErrorResponse(`Please upload an image file`, 400))

  }
  if(file.size > process.env.MAX_FILE_UPLOAD) {
    return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400))
  }

  file.name = `photo_${data._id}${path.parse(file.name).ext}`
  console.log(file.name)
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if(err) {
        console.log(err)
        return next( new ErrorResponse(`Problem with file upload`,500) )
    }
        await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name})
        res.status(200).json({
            success: true,
            data: file.name
        })
  })
};
