const express = require("express");
const { addVehicle, getUserVehicles, deleteVehicle, updateVehicle, getVehicles } = require("../controllers/vehicleController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/", authMiddleware({ roles: ["user"] }), addVehicle);
router.get("/user", authMiddleware({ roles: ["user"] }), getUserVehicles);
router.get("/", authMiddleware(), getVehicles);
router.delete("/:id", authMiddleware({ roles: ["user"] }), deleteVehicle);
router.put("/:id", authMiddleware({ roles: ["user"] }), updateVehicle);

module.exports = router;
