const Review = require('../models/Review');
const Doctor = require('../models/Doctor');

// Add review
exports.addReview = async (req, res) => {
  try {
    const { doctorId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Create review
    const review = new Review({
      patientId: req.user.id,
      doctorId,
      rating,
      comment,
    });

    await review.save();

    // Update doctor's average rating
    const allReviews = await Review.find({ doctorId });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    doctor.rating = parseFloat(avgRating.toFixed(1));
    doctor.numberOfReviews = allReviews.length;
    await doctor.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get reviews for a doctor
exports.getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const reviews = await Review.find({ doctorId })
      .populate('patientId', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;