const express = require("express");

const {
    createExchangeRequest,
    getMyRequests,
    getIncomingRequests,
    updateExchangeRequest,
    completeExchange,
    getExchangeStats
} = require("../controllers/exchangeController");

const router = express.Router();

router.post("/", createExchangeRequest);

router.get(
    "/my-requests/:user_id",
    getMyRequests
);

router.get(
    "/incoming/:user_id",
    getIncomingRequests
);

router.put(
    "/:request_id",
    updateExchangeRequest
);

router.put(
    "/:request_id/complete",
    completeExchange
);

router.get(
    "/stats/:user_id",
    getExchangeStats
);

module.exports = router;