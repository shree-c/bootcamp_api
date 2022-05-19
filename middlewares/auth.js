//middleware functions related to authentication
//these would be added to the routes and are run before the core functions to do authorization
//for verifying sent tokens
const jwt = require('jsonwebtoken');
//we are using it for every route functions
const asynchandler = require('../utils/asynchandler');
//needed in case of error
const ErrorResponse = require('../utils/customError');
//needed to make request to db
const User = require('../models/Users');
//protect the routes
exports.protect = asynchandler(async (req, res, next) => {
    //extract the token if it is sent
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else {
        return next(new ErrorResponse('unauthorized access', 401));
    }
    //something wrong is sent
    if (!token) {
        return next(new ErrorResponse('unauthorized access', 401));
    }
    try {
        const tokencontents = jwt.verify(token, process.env.JWT_SECRET);
        //get the user from db and put it on req.user
        req.user = await User.findById(tokencontents.id);
        if (!req.user) {
            return next(new ErrorResponse('internal server error', 500));
        }
        return next();
    } catch (error) {
        return next(new ErrorResponse('unauthorized access', 401));
    }
});

//grant access to specific roles
//always put this after protect, bc request.user is set by protect
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`user role "${req.user.role}" is unauthorized to access this route`, 403));
        }
        next();
    };
};