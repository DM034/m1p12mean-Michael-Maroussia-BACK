const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { getInvoiceByAppointment } = require("../controllers/invoiceController");

router.get("/:appointmentId", authMiddleware({ roles: ["admin", "user"] }), getInvoiceByAppointment);

module.exports = router;
