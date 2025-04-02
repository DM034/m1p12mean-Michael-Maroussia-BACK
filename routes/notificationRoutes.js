const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// ✅ Les noms des fonctions doivent correspondre à ce qui est exporté dans notificationController
router.get('/', auth(), notificationController.getUserNotifications);
router.patch('/:notificationId', auth(), notificationController.markAsRead);
router.post('/', auth(), notificationController.sendNotification);

module.exports = router;
