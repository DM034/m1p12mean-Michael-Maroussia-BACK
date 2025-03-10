const express = require("express");
const {
    createQuote,
    getUserQuotes,
    confirmQuote,
    deleteQuote
} = require("../controllers/quoteController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/", authMiddleware({ roles: ["user"] }), createQuote);
router.get("/", authMiddleware({ roles: ["user"] }), getUserQuotes);
router.put("/:id/confirm", authMiddleware({ roles: ["user"] }), confirmQuote);
router.delete("/:id", authMiddleware({ roles: ["user"] }), deleteQuote);

module.exports = router;
