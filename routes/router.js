const router = require('express').Router();
const { getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsByZipcodeAndRadius } = require('../controllers/bootcamp')

router.route('/')
    .get(getBootcamps)
    .post(createBootcamp)



router.route('/:id')
    .get(getBootcamp)
    .put(updateBootcamp)
    .delete(deleteBootcamp)

router.route('/radius/:zipcode/:distance').get(getBootcampsByZipcodeAndRadius)
module.exports = router;