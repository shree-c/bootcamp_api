//course router just like bootcamp router
const router = require('express').Router({
    mergeParams: true
});
const { getAllCourses } = require('../controllers/courses');

router.route('/')
    .get(getAllCourses);

module.exports = router;