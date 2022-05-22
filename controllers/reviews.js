const { advancedReviewResults } = require('../middlewares/advancedResults');
const Bootcamps = require('../models/Bootcamps');
const Reviews = require('../models/Reviews');
const async_handler = require("../utils/asynchandler");
const ErrorResponse = require("../utils/customError");

// @desc    get all reviews for a boocamp
// @route   GET /api/v1/reviews/:bootcamp
// @access  Public
exports.getAllReviews = async_handler(async function (req, res, next) {
    // await advancedReviewResults(req, res, next);
    res.status(200)
        .json({
            reviews: res.advancedResults
        });
});

// @desc    get all reviews from a user
// @route   GET /api/v1/reviews/:user
// @access  Public
exports.getAllUserReviews = async_handler(async function (req, res, next) {
    const reviews = await Reviews.find({ user: req.params.user });
    res.status(200)
        .json({
            reviews: reviews
        });
});

// @desc    add a review
// @route   POST /api/v1/reviews/:bootcamp
// @access  Private(users)
// user is allowed to add only one review
exports.addReview = async_handler(async function (req, res, next) {
    req.body.user = req.user.id;
    req.body.bootcamp = req.params.bootcamp;
    const bootcamp = await Bootcamps.findById(req.params.bootcamp);
    if (!bootcamp) {
        return next(new ErrorResponse(`the bootcamp with id : ${req.params.bootcamp} doesn't exist`, 404));
    }
    if (bootcamp.user.toString() === req.user.id) {
        return next(new ErrorResponse(`a bootcamp publisher cannot write review for it`, 403));
    }
    if (await Reviews.findOne({ bootcamp: req.body.bootcamp, user: req.user.id })) {
        return next(new ErrorResponse(`a user can write only one review on a bootcamp`, 400));
    }
    const review = await Reviews.create(req.body);
    res.status(200)
        .json({
            success: true,
            reviews: review
        });
});

// @desc    update a review
// @route   POST /api/v1/reviews/:reviewid
// @access  Private(users)
// a bootcamp can have only one review form the user, so we are using the combination of boocampid and userid to search and update the review
exports.updateReview = async_handler(async function (req, res, next) {
    req.body.user = req.user.id;
    const review = await Reviews.findById(req.params.reviewid);
    if (!review) {
        return next(new ErrorResponse(`review not found`, 404));
    }
    if (review.user.toString() != req.user.id) {
        return next(new ErrorResponse(`you are not the owner of this review`, 401));
    }
    Object.keys(req.body).forEach((val) => {
        review[val] = req.body[val];
    });
    await review.save({ validateBeforeSave: true });
    res.status(200)
        .json({
            success: true,
            reviews: review
        });
});

// @desc    delete a review
// @route   DELETE /api/v1/reviews/:reviewid
// @access  Private(users)
//i want admin have the ablity to delete reviews so useing reviewid
exports.deleteReview = async_handler(async function (req, res, next) {
    let review = await Reviews.findById(req.params.reviewid);
    if (!review) {
        return next(new ErrorResponse(`review with id ${req.params.reviewid} doesn't exist`, 404));
    }
    if (req.user.id === review.user.toString() || req.user.role === 'admin') {
        review = await Reviews.findByIdAndDelete(req.params.reviewid);
    } else {
        return next(new ErrorResponse(`you are not authorized to delete this review`, 401));
    }
    res.status(200)
        .json({
            success: true,
            data: review
        });
});