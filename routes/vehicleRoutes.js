const express = require("express");
const { addVehicle, getUserVehicles, deleteVehicle, updateVehicle } = require("../controllers/vehicleController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/", authMiddleware({ roles: ["user"] }), addVehicle);
router.get("/user", authMiddleware({ roles: ["user"] }), getUserVehicles);
router.delete("/:id", authMiddleware({ roles: ["user"] }), deleteVehicle);
router.put("/:id", authMiddleware({ roles: ["user"] }), updateVehicle);

module.exports = router;
