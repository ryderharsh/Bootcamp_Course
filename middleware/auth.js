const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");
const Doctor = require("../models/Doctor");

//Protect routes
exports.protect = async (req, res, next) => {
  let token;
  console.log(req.headers.authorization.startsWith("bearer"));
  if (
    req.headers.authorization &&
    (req.headers.authorization.startsWith("Bearer") ||
      req.headers.authorization.startsWith("bearer"))
  )
  {
    //Set token from Bearer token in header
    token = req.headers.authorization.split(" ")[1];
  }
  //Set token from cookie 
  // else if(req.cookies.token) {
  //      token = req.cookies.token
  // }

  //Make sure token exists
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 402));
  }
  try {
    //verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.doctor = await Doctor.findById(decoded.id);
    next();
  } catch (e) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
};
//Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.doctor.role)) {
      return next(
        new ErrorResponse(
          `Doctor role ${req.doctor.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
}
