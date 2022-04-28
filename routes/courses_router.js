//course router just like bootcamp router
const router = require('express').Router({
    mergeParams: true
});
const { getAllCourses, getCourse, addCourse, updateCourse, deleteCourse } = require('../controllers/courses');

router.route('/')
    .get(getAllCourses)
    .post(addCourse);

router.route('/:id')
    .get(getCourse)
    .put(updateCourse)
    .delete(deleteCourse);

module.exports = router;