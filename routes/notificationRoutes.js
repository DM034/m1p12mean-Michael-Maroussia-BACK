// notificationRoute.js
const express = require('express');
const router = express.Router();
const notificationController = require('./../controllers/notificationController');
const auth = require('../middleware/auth');

let socketFunctions;

// Middleware pour initialiser les fonctions socket
router.use((req, res, next) => {
  // Vérification pour s'assurer que socketFunctions est initialisé
  if (!socketFunctions) {
    // Récupération de l'instance io depuis l'application Express
    const io = req.app.get('io');
    if (io) {
      const socketHandler = require('./../utils/socket');
      socketFunctions = socketHandler(io);
      notificationController.setSocketFunctions(socketFunctions);
    } else {
      console.error('io n\'est pas disponible dans l\'application Express');
    }
  }
  next();
});

// Routes pour les notifications
router.use(auth());
router.get('/', notificationController.getAllNotifications);
router.post('/', notificationController.createNotification);
router.put('/:notificationId/read', notificationController.markNotificationAsRead);
router.put('/user/:userId/read-all', notificationController.markAllNotificationsAsRead);
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router;