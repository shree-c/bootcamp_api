const { protect, authorize } = require("../middlewares/auth");
const { advancedResults, advancedReviewResults } = require("../middlewares/advancedResults");
const { getAllReviews, getAllUserReviews, addReview, updateReview, deleteReview } = require('../controllers/reviews');
const express = require("express");
const router = express.Router();

router.route('/:user')
    .get(getAllUserReviews);

router.route('/:bootcamp')
    .post(protect, addReview);

router.route('/:reviewid')
    .delete(protect, deleteReview)
    .put(protect, updateReview);

router.route('/bootcamp/:bootcamp')
    .get(advancedReviewResults, getAllReviews);

module.exports = router;