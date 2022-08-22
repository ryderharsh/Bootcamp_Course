const mongoose = require("mongoose")
const Bootcamp = require("./Bootcamp")

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, "Please add  the Review title"],
        maxlength: 100
    },
    text: {
        type: String,
        required: [true, "Please add some description"]
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, "Please add rating between 1 to 10"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    client: {
        type: mongoose.Schema.ObjectId,
        ref: "Bootcamp",
        required: true
    },
    doctor: {
        type: mongoose.Schema.ObjectId,
        ref: "Doctor",
        required: true
    }
})
//Prevent doctor from summitting more than one review per bootcamp
ReviewSchema.index({ bootcamp:1, doctor:1 },{ unique: true })

ReviewSchema.statics.getAverageRating = async function(bootcampId){
    const obj = await this.aggregate([
        {
            $match: {client: bootcampId }
        },
        {
            $group: {
                _id: "$client",
                averageRating: { $avg: "$rating" }
            }
        }
    ])
    try{
        const opp = await this.model("Bootcamp").findByIdAndUpdate(bootcampId,{
            averageRating: obj[0].averageRating
        })
        await opp.save()
    } catch (err) {
        console.error(err)
    }
}

ReviewSchema.post("save", function(){
    this.constructor.getAverageRating(this.client)
})

ReviewSchema.pre("remove", function(){
    this.constructor.getAverageRating(this.client)
})
module.exports = mongoose.model("Review", ReviewSchema)