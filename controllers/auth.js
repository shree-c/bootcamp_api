const Users = require("../models/Users");
const async_handler = require("../utils/asynchandler");
const ErrorResponse = require("../utils/customError");

// @desc    register a user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async_handler(async (req, res, next) => {
    const { name, email, password, role } = req.body;
    const user = await Users.create({
        name,
        email,
        password,
        role
    });
    sendTokenResponse(user, res, 200);
});
// @desc    user login
// @route   POST /api/v1/auth/register
// @access  Public
exports.login = async_handler(async function (req, res, next) {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorResponse('include email and password', 400));
    }
    //querying for the user
    //include password
    const user = await Users.findOne({ email }).select('+password');
    if (!user) {
        return next(new ErrorResponse('wrong email or password', 401));
    }
    //password comparision
    if (!await user.compare(password)) {
        return next(new ErrorResponse('wrong email or password', 401));
    }
    sendTokenResponse(user, res, 200);
});

// @desc    get user info
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async_handler(async function (req, res, next) {
    //in the tutorial brad has again queried the db with the id from req.user.id set by the protect function
    //I thought it was unncessary since all the info is available req.user
    res.status(200)
        .json({
            success: true,
            data: req.user
        });
});

//for sending token response
function sendTokenResponse(user, res, statusCode) {
    //create token
    const token = user.getSignedJwtToken();
    //cookie options
    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000),
        httpOnly: true
    };
    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        });
}