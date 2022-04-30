const router = require('express').Router();
const { getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsByZipcodeAndRadius, bootcampPhotoUpload } = require('../controllers/bootcamp');
const advancedResults = require('../middlewares/advancedResults');
const Bootcamps = require('../models/Bootcamps');
//rerouting /:bootcamps/courses to course router
const course_router = require('./courses_router');
router.use('/:bootcampId/courses', course_router);
//it returns the router again so that we can chain requests
//using advanced results middleware for that particular path
router.route('/')
    .get(advancedResults(Bootcamps, {
        path: 'courses',
        select: 'title'
    }), getBootcamps)
    .post(createBootcamp);

router.route('/:id')
    .get(getBootcamp)
    .put(updateBootcamp)
    .delete(deleteBootcamp);

router.route('/:id/photo')
    .put(bootcampPhotoUpload);

router.route('/radius/:zipcode/:distance').get(getBootcampsByZipcodeAndRadius);

module.exports = router;