const express = require('express');
const { addReview, getDoctorReviews } = require('../controllers/reviewController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, addReview);
router.get('/doctor/:doctorId', getDoctorReviews);

module.exports = router;