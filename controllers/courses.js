//just like bootcamps controller but for courses
const ErrorResponse = require('../utils/customError');
const async_handler = require('../utils/asynchandler');
const Course = require('../models/Courses');
const Bootcamps = require('../models/Bootcamps');

// @desc    Get all courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public

exports.getAllCourses = async_handler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const courses = await Course.find({
            bootcamp: req.params.bootcampId
        });
        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } else {
        //using advanced results middleware
        res.status(200).json(res.advancedResults);
    }
}
);

// @desc    Get single course
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = async_handler(async (req, res, next) => {
    let query = Course.find({ _id: req.params.id }).populate({
        path: 'bootcamp',
        select: 'name description'
    });
    const course = await query;
    if (!course) {
        return next(
            new ErrorResponse(`no course exists with ${req.params.id}`, 404)
        );
    }
    res.status(200).json({
        success: true,
        data: course
    });
}
);

// @desc    add a course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  private
//course is added with the help of bootcamp id the course belongs
//the user logged in should be the owner of the bootcamp
//course is linked to bootcamp and it's and the user who should be the owner of the bootcamp
exports.addCourse = async_handler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    //adding user id from protect function
    req.body.user = req.user.id;
    const bootcamp = await Bootcamps.findById(req.params.bootcampId);
    if (!bootcamp) {
        return next(
            new ErrorResponse(`no bootcamp exists with ${req.params.bootcampId}`, 404)
        );
    }
    //has to be the owner of the bootcamp
    if (req.user.id !== bootcamp.user.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse(`${req.user.id} is not the owner of this course`, 401));
    }
    const course = await Course.create(req.body);
    res.status(200).json({
        success: true,
        data: course
    });
}
);

// @desc    update a course
// @route   PUT /api/v1/courses/:id
// @access  private
exports.updateCourse = async_handler(async (req, res, next) => {
    const course = await Course.findById(req.params.id);
    if (!course) {
        return next(
            new ErrorResponse(`no course exists with ${req.params.id}`, 404)
        );
    }
    if (req.user.id !== course.user.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse(`${req.user.id} is not the owner of this course`, 401));
    }
    await Course.findByIdAndUpdate(req.params.id, req.body, {
        runValidators: true,
        new: true
    });
    res.status(200).json({
        success: true,
        data: course
    });
}
);

// @desc    delete a course
// @route   PUT /api/v1/courses/:id
// @access  private
exports.deleteCourse = async_handler(async (req, res, next) => {
    const course = await Course.findById(req.params.id);
    if (!course) {
        return next(
            new ErrorResponse(`no course exists with ${req.params.id}`, 404)
        );
    }
    if (req.user.id !== course.user.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse(`${req.user.id} is not the owner of this course`, 401));
    }
    await course.remove();
    res.status(200).json({
        success: true,
        data: course
    });
}
);