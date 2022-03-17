//importing mongoose schema
const Bootcamp = require('../models/Bootcamps')
//importing custom error object
const ErrorResponse = require('../utils/customError');
//importing async handler
//takes a function resolves it and calls next(error) for error handling
//to get rid of try..catch blocks
const async_handler = require('../utils/asynchandler');
//bringing in node-geocoder to convert zipcode to latitude and longitudes
const geocoder = require('../utils/geocoder')
// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public

exports.getBootcamps = async_handler(async (req, res, next) => {
    const bootcamps = await Bootcamp.find();
    res.status(200).json({
        status: 'success',
        count: bootcamps.length,
        data: bootcamps
    });
})
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
})

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
})
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
})
// @desc    Delete single bootcamps
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private

exports.deleteBootcamp = async_handler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
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
})

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
    })
    res.status(200).json({
        success: true,
        data: bootcamps
    })
})