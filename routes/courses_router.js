//course router just like bootcamp router
const router = require('express').Router({
    mergeParams: true
});
const { getAllCourses, getCourse, addCourse, updateCourse, deleteCourse } = require('../controllers/courses');
const advancedResults = require('../middlewares/advancedResults');
const Courses = require('../models/Courses');

router.route('/')
    .get(advancedResults(Courses, {
        path: 'bootcamp',
        select: 'name _id'
    }), getAllCourses)
    .post(addCourse);

router.route('/:id')
    .get(getCourse)
    .put(updateCourse)
    .delete(deleteCourse);

module.exports = router;