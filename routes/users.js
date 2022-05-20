const express = require("express");
const { protect, authorize } = require("../middlewares/auth");
const { getAllUsers, getSingleUser, deleteSingleUser, updateUserDetails, createSingleUser } = require('../controllers/users');
const advancedResults = require("../middlewares/advancedResults");
const Users = require("../models/Users");
const router = express.Router();

router.use(protect);
// router.use(authorize('admin'));

router.route('/')
    .get(advancedResults(Users), getAllUsers)
    .post(createSingleUser);

router.route('/:id')
    .get(getSingleUser)
    .delete(deleteSingleUser)
    .put(updateUserDetails);

module.exports = router;