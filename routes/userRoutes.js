const express = require("express");
const router = express.Router();
const { registerMechanic } = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");

router.post("/register/mechanic", authMiddleware({ roles: ["admin"] }), registerMechanic);

module.exports = router;
