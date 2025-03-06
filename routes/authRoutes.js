const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');

const router = express.Router();

// Route pour l'inscription
router.post('/register', registerUser);

// Route pour la connexion
router.post('/login', loginUser);

module.exports = router;
