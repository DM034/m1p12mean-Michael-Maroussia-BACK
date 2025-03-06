const express = require("express");
const authMiddleware = require("../middleware/auth");
const { updateUserRole } = require("../controllers/adminController");

const router = express.Router();

router.use(authMiddleware({ roles: ["admin"] }));

router.put("/user/role", updateUserRole);

module.exports = router;
