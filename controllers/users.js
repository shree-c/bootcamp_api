//all admin based routes
const Users = require("../models/Users");
const async_handler = require("../utils/asynchandler");
const ErrorResponse = require("../utils/customError");

// @desc    get all users
// @route   GET /api/v1/users/
// @access  Private(admin)
exports.getAllUsers = async_handler(async function (req, res, next) {
    res.status(200)
        .json(res.advancedResults);
});

// @desc    get single user
// @route   GET /api/v1/users/:id
// @access  Private(admin)
exports.getSingleUser = async_handler(async function (req, res, next) {
    const user = await Users.findById(req.params.id);
    if (!user) {
        return next(new ErrorResponse(`the user with id : ${req.params.id} doesn't exist`, 404));
    }
    res.status(200)
        .json({
            success: true,
            data: user
        });
});

// @desc    update user details
// @route   PUT /api/v1/users/:id
// @access  Private(admin)
exports.updateUserDetails = async_handler(async function (req, res, next) {
    const user = await Users.findById(req.params.id);
    if (!user) {
        return next(new ErrorResponse(`user not found with id: ${req.params.id}`, 404));
    }
    Object.keys(req.body).forEach((val) => {
        user[val] = req.body[val];
    });
    await user.save({ validateBeforeSave: true });

    res.status(200)
        .json({
            success: true,
            data: user
        });
});

// @desc    create single user
// @route   POST /api/v1/users
// @access  Private(admin)
exports.createSingleUser = async_handler(async function (req, res, next) {
    const user = await Users.create(req.body);
    res.status(201)
        .json({
            success: true,
            data: user
        });
});

// @desc    create single user
// @route   DELETE /api/v1/users/:id
// @access  Private(admin)
exports.deleteSingleUser = async_handler(async function (req, res, next) {
    await Users.findByIdAndDelete(req.params.id);
    res.status(201)
        .json({
            success: true,
            data: {}
        });
});
