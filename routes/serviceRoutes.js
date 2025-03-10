const express = require("express");
const {
    createService,
    getServices,
    getServiceById,
    updateService,
    deleteService
} = require("../controllers/serviceController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/", getServices);
router.get("/:id", getServiceById);

router.post("/", authMiddleware({ roles: ["admin"] }), createService);
router.put("/:id", authMiddleware({ roles: ["admin"] }), updateService);
router.delete("/:id", authMiddleware({ roles: ["admin"] }), deleteService);

module.exports = router;
