const express = require("express");
const { addVehicle, getUserVehicles, deleteVehicle } = require("../controllers/vehicleController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/", authMiddleware({ roles: ["user"] }), addVehicle);
router.get("/", authMiddleware({ roles: ["user"] }), getUserVehicles);
router.delete("/:id", authMiddleware({ roles: ["user"] }), deleteVehicle);

module.exports = router;
