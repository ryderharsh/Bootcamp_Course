const express = require("express")
const { getUsers,
        getUser,
        createUser,
        updateUser,
        deleteUser} = require("../controllers/docurd")
const Doctor =require("../models/Doctor")

const router = express.Router({ mergeParams: true });
const advanceResults = require("../middleware/advanceResults") 
const { protect, authorize } = require("../middleware/auth")

router.use(protect)
router.use(authorize("MRCP"))      

router.route("/")
.get(advanceResults(Doctor), getUsers)
.post(createUser)
        
router
.route("/:id")
.get(getUser)
.put(updateUser)
.delete(deleteUser)

module.exports = router;