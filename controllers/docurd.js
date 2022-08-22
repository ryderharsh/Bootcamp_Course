const Doctor = require("../models/Doctor")
const ErrorResponse = require("../utils/errorResponse")

exports.getUsers = async (req,res, next) => {
    res.status(200).json(res.advanceResults)
}

exports.getUser = async (req,res, next) => {
const user = await Doctor.findById(req.params.id)
    res.status(200).json({
        success: true,
        data: user
    })
}

exports.createUser = async (req,res, next) => {
const user = await Doctor.create(req.body)

    res.status(200).json({
            success: true,
            data: user
        })
    }

exports.updateUser = async (req,res, next) => {
const user = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
})
        
    res.status(200).json({
        success: true,
        data: user
        })
}

exports.deleteUser = async (req,res, next) => {
    await Doctor.findByIdAndDelete(req.params.id)
        res.status(200).json({
            success: true,
            data: {}
            })
    }