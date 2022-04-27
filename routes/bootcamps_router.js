const router = require('express').Router();
const { getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsByZipcodeAndRadius } = require('../controllers/bootcamp');
//rerouting /:bootcamps/courses to course router
const course_router = require('./courses_router');
router.use('/:bootcampId/courses', course_router);
//it returns the router again so that we can chain requests
router.route('/')
    .get(getBootcamps)
    .post(createBootcamp);

router.route('/:id')
    .get(getBootcamp)
    .put(updateBootcamp)
    .delete(deleteBootcamp);

router.route('/radius/:zipcode/:distance').get(getBootcampsByZipcodeAndRadius);

module.exports = router;