const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { getInvoiceByAppointment } = require("../controllers/billingController");

router.get("/:appointmentId", authMiddleware({ roles: ["admin", "user"] }), getInvoiceByAppointment);

module.exports = router;
