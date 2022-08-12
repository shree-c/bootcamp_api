const path = require('path');
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
    //using advanced results middleware
    res.status(200).json(res.advancedResults);
});

// @desc    create bootcamps
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = async_handler(async (req, res, next) => {
    //assigning user field from the protect route
    req.body.user = req.user;
    //making sure a publisher can publish only a single bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });
    if (publishedBootcamp) {
        return next(new ErrorResponse('a publisher can publish only one bootcamp', 403));
    }
    if (req.user.role !== 'publisher' && req.user.role !== 'admin') {
    	return next(new ErrorResponse('you should be a publisher to create bootcmaps', 400));
    }
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
    const bootcamp = await Bootcamp.findById(req.params.id).populate({
        path: 'courses',
        select: 'title'
    });
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
    let bootcamp = await Bootcamp.findById(req.params.id);
    //if the id is not found but in valid format
    //return because you can set properties more than once even though thery are in if statements etc.
    if (!bootcamp) {
        return next(new ErrorResponse(`bootcamp not found with id: ${req.params.id}`, 404));
    }
    //make sure the user is bootcamp owner or an admin
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`you are not authorized to do this action`));
    }
    //needs to be changed geocoder middleware doesn't run for this query
    //changed it so that validators can run on updation
    Object.keys(req.body).forEach((val) => {
        bootcamp[val] = req.body[val];
    });
    await bootcamp.save({ validateBeforeSave: true });
    // bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    //     runValidators: true,
    //     new: true
    // });
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
    //make sure the user is bootcamp owner or an admin
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`you are not authorized to do this action`));
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

// @desc    upload file to server
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
//remember the photo has to be sent with the key value 'file'
exports.bootcampPhotoUpload = async_handler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    //if the id is not found but in valid format
    //return because you can set properties more than once even though thery are in if statements etc.
    if (!bootcamp) {
        return next(new ErrorResponse(`bootcamp not found with id: ${req.params.id}`, 404));
    }
    //make sure the user is bootcamp owner or an admin
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`you are not authorized to do this action`));
    }
    if (!req.files) {
        return next(new ErrorResponse(`please upload a file`, 400));
    }
    const file = req.files.file;
    //file validations
    //file type
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`the file has to be an image`, 400));
    }
    //file size
    if (file.size > process.env.FILE_MAX_SIZE) {
        return next(new ErrorResponse(`the file is too large(< 1 MB)`, 400));
    }
    //changing the file name to an unique name
    file.name = `photo_${bootcamp._id}${path.extname(file.name)}`;
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.log(err);
            return next(new ErrorResponse(`server error happened, please try later`, 500));
        }
        await Bootcamp.findByIdAndUpdate(bootcamp._id, {
            photo: file.name
        });
        res.status(200).json({
            status: 'success',
            data: file.name
        });
    });

});
