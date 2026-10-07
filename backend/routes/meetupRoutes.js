const express = require("express");

const {
    getMeetup,
    createMeetup,
    updateMeetup
} = require("../controllers/meetupController");

const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:requestId", verifyToken, getMeetup);

router.post("/:requestId", verifyToken, createMeetup);

router.put("/:requestId", verifyToken, updateMeetup);

module.exports = router;