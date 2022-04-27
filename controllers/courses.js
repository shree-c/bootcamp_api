//just like bootcamps controller but for courses
const ErrorResponse = require('../utils/customError');
const async_handler = require('../utils/asynchandler');
const Course = require('../models/Courses');

// @desc    Get all courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public

exports.getAllCourses = async_handler(async (req, res, next) => {
    //building query is different from executing query
    //use await to execute the query
    console.log(req.params);
    let query;
    if (req.params.bootcampId) {
        query = Course.find({
            bootcamp: req.params.bootcampId
        });
    } else {
        //populate the result with info of bootcamps the course is made for
        query = Course.find().populate({
            path: 'bootcamp',
            select: 'name description'
        });
    }
    const courses = await query;
    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    });
}
);