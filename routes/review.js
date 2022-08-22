const express = require("express");
const router = express.Router({ mergeParams: true });
const { protect,authorize } = require("../middleware/auth")
const { 
        getReview, 
        getSingleReview, 
        addReview, 
        updateReview,
        deleteReview } =  require("../controllers/review")

const Review =require("../models/Review")
const advanceResults = require("../middleware/advanceResults")        

router.route("/")
.get(advanceResults(Review,{
        path: "client",
        select: "name email"
}),getReview)
.post(protect,authorize("MD","MRCP"),addReview)


router
.route("/:id")
.get(getSingleReview)
.put(protect,authorize("MD","MRCP"),updateReview)
.delete(protect,authorize("MD","MRCP"),deleteReview)


module.exports = router;