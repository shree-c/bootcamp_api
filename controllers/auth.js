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
    const token = user.getSignedJwtToken();
    res.status(200).json({
        success: true,
        token
    });
});
// @desc    register a user
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
    const token = user.getSignedJwtToken();
    res.status(200).json({
        success: true,
        token
    });
});