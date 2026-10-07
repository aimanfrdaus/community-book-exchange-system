const express = require("express");

const {
    createRating,
    getUserRatings,
    getMyRatingForExchange
} = require("../controllers/ratingController");

const {
    verifyToken
} = require("../middleware/authMiddleware");

const router = express.Router();


// Submit a rating
router.post(
    "/",
    verifyToken,
    createRating
);


// Get ratings received by a user
router.get(
    "/user/:userId",
    verifyToken,
    getUserRatings
);


// Check whether the current user has rated an exchange
router.get(
    "/exchange/:requestId",
    verifyToken,
    getMyRatingForExchange
);


module.exports = router;    