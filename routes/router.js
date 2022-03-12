const router = require('express').Router();
const { getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp } = require('../controllers/bootcamp')
const { logger } = require('../middlewares/logger')

router.use(logger);
router.route('/')
    .get(getBootcamps)
    .post(createBootcamp)



router.route('/:id')
    .get(getBootcamp)
    .put(updateBootcamp)
    .delete(deleteBootcamp)
module.exports = router;