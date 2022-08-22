const mongoose = require("mongoose")
const Bootcamp = require("./Bootcamp")

const DietSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, "Please add  the Diet title"]
    },
    descrip: {
        type: String,
        required: [true, "Please add the Diet description"]
    },
    weeks: {
        type: String,
        required: [true, "Please add number of weeks"]
    },
    cost: {
        type: Number,
        required: [true, "Please add the Diet cost"]
    },
    level: {
        type: String,
        required: [true, "Please add a level"],
        enum: ["beginner", "intermediate", "advanced"]
    },
    gym: {
        type: Boolean,
        default: false
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
        ref: "Doctor"
    }
})

DietSchema.statics.getAverageCost = async function(bootcampId){
    console.log("Calculating avg cost")
    const obj = await this.aggregate([
        {
            $match: {client: bootcampId }
        },
        {
            $group: {
                _id: "$bootcamp",
                averageCost: { $avg: "$cost" }
            }
        }
    ])
    console.log(obj)
    try{
        const opp = await this.model("Bootcamp").findByIdAndUpdate(bootcampId,{
            averageCost: Math.ceil(obj[0].averageCost/10)*10
        })
        await opp.save()
    } catch (err) {
        console.error(err)
    }
}

DietSchema.post("save", function(){
    this.constructor.getAverageCost(this.client)
})

DietSchema.pre("remove", function(){
    this.constructor.getAverageCost(this.client)
})

module.exports = mongoose.model("Diet", DietSchema)