const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { createInvoiceFromAppointment } = require("../controllers/invoiceController");

router.post("/create/:appointmentId", authMiddleware({ roles: ["admin", "user"] }), createInvoiceFromAppointment);

module.exports = router;
