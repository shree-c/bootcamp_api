//importing mongoose schema
const Bootcamp = require('../models/Bootcamps');
//importing custom error object
const ErrorResponse = require('../utils/customError');
//importing async handler
//takes a function resolves it and calls next(error) for error handling
//to get rid of try..catch blocks
const async_handler = require('../utils/asynchandler');
//bringing in node-geocoder to convert zipcode to latitude and longitudes
const geocoder = require('../utils/geocoder');

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = async_handler(async (req, res, next) => {
    //now also passing req.query to db
    console.log(req.query);
    //copying query object because it now contains some fields that cannot be used for querying
    const queryObj = { ...req.query };
    //we want to delete select, and sort key in object because we need it for filtering but not querying
    const deleteFields = ['select', 'sort', 'page', 'limit'];
    deleteFields.forEach(val => delete queryObj[val]);

    //replacing operators such as lt with $lt etc
    const queryStr = JSON.stringify(queryObj).replace(/\b(gt|eq|gte|lt|lte|in)\b/g, match => `$${match}`);

    //building query
    let query = Bootcamp.find(JSON.parse(queryStr));
    //we are modifying the query as we go down
    //if select field exist
    if (req.query.select) {
        //converting select key's comma seperated values to space seperated string
        const selectstr = req.query.select.split(',').join(' ');
        query = query.select(selectstr);
    }
    //if sorting is given
    //-key would sort in opposite order
    if (req.query.sort) {
        //converting select key's comma seperated values to space seperated string
        const sort = req.query.sort.split(',').join(' ');
        query = query.sort(sort);
    } else {
        //default: descending created at
        query = query.sort('-createdAt');
    }
    //pagination
    const page = parseInt(req.query.page, 10) || 1; //converting to number
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Bootcamp.countDocuments();
    query = query.skip(startIndex).limit(limit);

    //making query to db
    //populating with virtual course field
    const bootcamps = await query.populate({
        path: 'courses',
        select: 'title'
    });

    //adding pagination info to the sending document
    const pagination = {};
    //startIndex and endIndex help to check whether we are within range
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit,
        };
    }
    if (startIndex > 0) {
        pagination.pre = {
            page: page - 1,
            limit
        };
    }
    res.status(200).json({
        status: 'success',
        count: bootcamps.length,
        data: bootcamps,
        pagination
    });
});

// @desc    create bootcamps
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = async_handler(async (req, res, next) => {
    //the data is added according to model and validation checks are done
    const bootcamp = await Bootcamp.create(req.body);
    res.status(200).json({
        status: 'success',
        data: bootcamp
    });
});

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = async_handler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    //if the id is not found but in valid format
    //return because you can set properties more than once even though thery are in if statements etc.
    if (!bootcamp) {
        //correct format but not found
        return next(new ErrorResponse(`bootcamp not found with id: ${req.params.id}`, 404));
    }
    res.status(200).json({
        status: 'success',
        id: req.params.id,
        data: bootcamp
    });
});

// @desc    Update single bootcamps
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = async_handler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        runValidators: true,
        new: true
    });
    //if the id is not found but in valid format
    //return because you can set properties more than once even though thery are in if statements etc.
    if (!bootcamp) {
        return next(new ErrorResponse(`bootcamp not found with id: ${req.params.id}`, 404));
    }
    res.status(200).json({
        status: 'success',
        id: req.params.id,
        data: bootcamp
    });
});

// @desc    Delete single bootcamps
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = async_handler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    //if the id is not found but in valid format
    //return because you can set properties more than once even though thery are in if statements etc.
    if (!bootcamp) {
        return next(new ErrorResponse(`bootcamp not found with id: ${req.params.id}`, 404));
    }
    bootcamp.remove();
    res.status(200).json({
        status: 'success',
        id: req.params.id,
        data: bootcamp
    });
});

// @desc    find bootcamps within given readius(km) of cordinates
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance(km)
// @access  Public
exports.getBootcampsByZipcodeAndRadius = async_handler(async (req, res, next) => {
    const { zipcode, distance } = req.params;
    console.log(zipcode, distance);
    const loc = await geocoder.geocode(zipcode);
    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: {
                //converting distance to radians: dividing it by radius of earth
                $centerSphere: [[loc[0].longitude, loc[0].latitude], distance / 6378.1]
            }
        }
    });
    res.status(200).json({
        success: true,
        data: bootcamps
    });
});
