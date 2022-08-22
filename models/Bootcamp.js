const mongoose = require("mongoose")
const slugify = require("slugify")

const BootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"],
        unique: true,
        trim: true,
        maxlength: [ 50, 'Name can not be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, "Please add a email"],
        unique: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,"please add a valid email"
        ],
        maxlength: [ 50, 'Email can not be more than 50 characters']
    },
    averageCost: {
        type: Number
    },
    averageRating: {
        type: Number
    },
    slug: {type: String},
    age: {type: Number},
    salary: {type: Number},
    heightincm: {type: Number},
    weightinkg: {type: Number},
    address: {
        type: String,
        required: [true, "Please add a address"],
        unique: true,
        trim: true,
        maxlength: [ 50, 'Address can not be more than 50 characters']
    },
    password: {
        type: String,
        required: [true, "Please enter the password"],
        unique: true,
        trim: true,
        maxlength: [ 15, 'Password can not be more than 15 characters']
    },
    iv: {
        type: String,
        required: [true, "Please add a iv"],
        unique: true,
        trim: true,
        maxlength: [ 10, 'IV can not be more than 10 characters']
    },
    doctor: {
        type: mongoose.Schema.ObjectId,
        ref: "Doctor"
    }
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

BootcampSchema.pre("save", function(next){
    this.slug = slugify(this.email, {lower: true})
    next();
});

BootcampSchema.pre("remove",async function (next) {
    console.log(`Diet chart is removed for id ${this._id}`)
    await this.model("Diet").deleteMany({ client: this._id })
    next()
})

BootcampSchema.virtual("diet", {
    ref: "Diet",
    localField: "_id",
    foreignField: "client",
    justOne: false
});

module.exports = mongoose.model("Bootcamp", BootcampSchema)