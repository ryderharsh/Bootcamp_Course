const Doctor = require("../models/Doctor")
const { options } = require("../routes/doctor")
const ErrorResponse = require("../utils/errorResponse")
const sendEmail = require("../utils/sendEmail")
const crypto = require("crypto")

exports.register = async (req,res, next) => {
    const { name, email, password, role } = req.body
//Create Doctor
    const doctor= await Doctor.create({
        name,
        email,
        password,
        role
    })
    sendTokenRespone(doctor, 200, res)
}

exports.login = async (req,res, next) => {
    const { email, password } = req.body

//Validate email and password
if(!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400)) 
}
//Check for the Doctor
const doctor = await Doctor.findOne({ email }).select("+password")
if(!doctor){
    return next(new ErrorResponse("Invalid Credentials", 401))
}
//Check if password matches
const isMatch = await doctor.matchPassword(password)
if(!isMatch){
    return next(new ErrorResponse("Invalid Credentials", 401))
}
 sendTokenRespone(doctor, 200, res)
}


//Clear Cookie
exports.logout = async(req,res,next) => {
    res.cookie("token" , "none",{
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true

    })
    res.status(200).json({
        success: true,
        data: {}
    })
}

exports.getMe = async(req,res,next) => {
    const doctor = await Doctor.findById(req.doctor.id)
    res.status(200).json({
        success: true,
        data: doctor
    })
}

exports.updateDetails = async(req,res,next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    }
    const doctor = await Doctor.findByIdAndUpdate(req.doctor.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    })
    res.status(200).json({
        success: true,
        data: doctor
    })
}

exports.updatePassword = async(req,res,next) => {
    const doctor = await Doctor.findById(req.doctor.id).select("+password")

//Check current password
if(!(await doctor.matchPassword(req.body.currentPassword))){
    return next(new ErrorResponse("Password is incorrect",401))
}
doctor.password = req.body.newPassword
await doctor.save()
sendTokenRespone(doctor, 200, res)
}

exports.forgotPassword = async(req,res,next) => {
    const doctor = await Doctor.findOne({email: req.body.email})
    if (!doctor) {
        return next(new ErrorResponse("There is no doctor with that email", 404))
    }

//Get reset token
const resetToken = doctor.getResetPasswordToken()
await doctor.save({ validateBeforeSave: false })

//Create reset URL
const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/doctor/resetpassword/${resetToken}`
const message = `You are receiving this mail because you (or someone else) has requested the reset password.
 Please make a PUT request to: \n\n ${resetUrl}`
 try {
    await sendEmail({
        email: doctor.email,
        subject: "Password reset token",
        message
    })
    res.status(200).json({ success: true, data: "Email sent" })
 }catch(err){
    console.log(err)
    doctor.resetPasswordToken = undefined;
    doctor.resetPasswordExpire = undefined;
    await doctor.save({ validateBeforeSave: false });
    return next(new ErrorResponse("Email could not be sent",500))
 }
    res.status(200).json({
        success: true,
        data: doctor
    })
}

exports.resetPassword = async(req,res,next) => {
//Get hashed token
const resetPasswordToken = crypto
.createHash("sha256")
.update(req.params.resettoken)
.digest("hex")

const doctor = await Doctor.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })
if(!doctor) {
    return next(new ErrorResponse("Invalid token", 400))
}
//Set password
doctor.password = req.body.password;
doctor.resetPasswordToken = undefined;
doctor.resetPasswordExpire = undefined;
await doctor.save();

sendTokenRespone(doctor, 200, res);
}

//Get token from model, create cookie and send response
const sendTokenRespone = (doctor, statusCode, res) =>{
    //Create token
    const token = doctor.getSignedJwtToken()

    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };
    if (process.env.NODE_ENV === "production") {
        options.secure = true
    }
    res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
        success: true,
        token
    })
}