const Users = require("../models/Users");
const async_handler = require("../utils/asynchandler");
const ErrorResponse = require("../utils/customError");
const sendEmail = require("../utils/nodemailer");
const crypto = require('crypto');

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

// @desc    forgot password
// @route   GET /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = async_handler(async function (req, res, next) {
    const user = await Users.findOne({ email: req.body.email });
    //check for that user
    if (!user) {
        return next(new ErrorResponse('no user with that email', 404));
    }
    //get our reset token
    const resetToken = user.getResetPasswordToken();

    //saving the manuplated user obj into db
    await user.save({
        validateBeforeSave: false
    });
    //sending the email
    //1. create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/resetpassword/${resetToken}`;
    //2. text for sending email
    const text = `Click on the link to reset your password : ${resetUrl}`;
    //3. sending email
    try {
        await sendEmail({
            text,
            subject: 'password reset',
            to: user.email
        });
        res.status(200).json({
            success: true,
            data: 'email sent'
        });
    } catch (error) {
        console.log(error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorResponse(`email can't be sent`, 500));
    }
});

// @desc    get user info
// @route   PUT /api/v1/auth/resetpassword/:resetId
// @access  Public
exports.resetPassword = async_handler(async function (req, res, next) {
    const hashedResetToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
    //if the token is present and time has not expired
    const user = await Users.findOne({
        resetPasswordToken: hashedResetToken,
        resetPasswordExpire: { $gt: Date.now() }
    });
    if (!user) {
        return next(new ErrorResponse(`invalid token`, 404));
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, data: `password has been reset` });
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