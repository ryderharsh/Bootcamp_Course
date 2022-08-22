const mongoose = require("mongoose")
const crypto = require("crypto")
const Bootcamp = require("./Bootcamp")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const DoctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add  the Doctor name"]
    },
    email: {
        type: String,
        required: [true, "Please add a email"],
        unique: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,"please add a valid email"
        ]
    },
    role: {
        type: String,
        enum: ["MBBS", "MS", "MD", "MRCP", "FRCS"],
        default: "MD"
    },
    password: {
        type: String,
        required: [true, "Please add a password"],
        minlength: 8,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt:{
        type: Date,
        default: Date.now
    }
})
//Password Encrption
DoctorSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next()
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password,salt)
})
//Sign JWT and return
DoctorSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}
//Match user enter password to hashed password
DoctorSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

//Generate and hash password token
DoctorSchema.methods.getResetPasswordToken = function() {
//Generate token
const resetToken = crypto.randomBytes(20).toString("hex")

//hash token and set to resetPasswordToken field
this.resetPasswordToken = crypto
.createHash("sha256")
.update(resetToken)
.digest("hex")

//Set expire
this.resetPasswordExpire = Date.now() + 10 * 60 * 1000
return resetToken
}
module.exports = mongoose.model("Doctor", DoctorSchema)