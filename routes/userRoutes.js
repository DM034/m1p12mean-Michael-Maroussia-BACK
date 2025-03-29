const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { registerUser } = require("../controllers/authController");
const { getUsers, getUserById, updateUser, deleteUser } = require("../controllers/userController");

router.post("/", authMiddleware({ roles: ["admin"] }), registerUser);
router.get("/", authMiddleware({ roles: ["admin"] }), getUsers);
router.get('/:id', authMiddleware(), getUserById);
router.put('/:id', authMiddleware(), updateUser);
router.delete('/:id', authMiddleware(), deleteUser);

module.exports = router;
