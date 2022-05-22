//course router just like bootcamp router
const router = require('express').Router({
    mergeParams: true
});
const { getAllCourses, getCourse, addCourse, updateCourse, deleteCourse } = require('../controllers/courses');
const { advancedResults } = require('../middlewares/advancedResults');
const { protect, authorize } = require('../middlewares/auth');
const Courses = require('../models/Courses');

router.route('/')
    .get(advancedResults(Courses, {
        path: 'bootcamp',
        select: 'name _id'
    }), getAllCourses)
    .post(protect, authorize('publisher', 'admin'), addCourse);

router.route('/:id')
    .get(getCourse)
    .put(protect, authorize('publisher', 'admin'), updateCourse)
    .delete(protect, authorize('publisher', 'admin'), deleteCourse);

module.exports = router;