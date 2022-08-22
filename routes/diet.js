const express = require("express");
const router = express.Router({ mergeParams: true });
const { protect,authorize } = require("../middleware/auth")
const { 
        getDiet, 
        getSingleDiet, 
        addDiet, 
        updateDiet,
        deleteDiet } =  require("../controllers/diet")

const Diet =require("../models/Diet")
const advanceResults = require("../middleware/advanceResults")        

router.route("/")
.get(advanceResults(Diet,{
        path: "client",
        select: "name email"
}),getDiet)
.post(protect,authorize("MD","MRCP"),addDiet)


router
.route("/:id")
.get(getSingleDiet)
.put(protect,authorize("MD","MRCP"),updateDiet)
.delete(protect,authorize("MD","MRCP"),deleteDiet)


module.exports = router;