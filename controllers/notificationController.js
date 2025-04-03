// notificationController.js
const mongoose = require("mongoose");
const Notification = require("./../models/Notification");

// Variable pour stocker les fonctions socket
let socketFunctions = {
  emitNewNotification: () => {},
  emitNotificationRead: () => {},
  emitAllNotificationsRead: () => {},
  emitNotificationDeleted: () => {},
};

// Méthode pour définir les fonctions socket
const setSocketFunctions = (functions) => {
  if (functions) {
    socketFunctions = functions;
  }
};

// Récupérer toutes les notifications d'un utilisateur
const getAllNotifications = async (req, res) => {
  try {
    console.log(req.user.id);
    const notifications = await Notification.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        message: "Erreur lors de la récupération des notifications",
        error,
      });
  }
};

// Créer une nouvelle notification
const createNotification = async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ message: "userId et message sont requis" });
    }

    const notification = new Notification({
      userId: mongoose.Types.ObjectId(userId),
      message,
    });

    const savedNotification = await notification.save();

    // Émettre la notification en temps réel via Socket.io
    socketFunctions.emitNewNotification(userId, savedNotification);

    res.status(201).json(savedNotification);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Erreur lors de la création de la notification",
        error,
      });
  }
};

// Marquer une notification comme lue
const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification non trouvée" });
    }

    // Informer les clients connectés que la notification a été lue
    socketFunctions.emitNotificationRead(
      notification.userId.toString(),
      notification._id
    );

    res.status(200).json(notification);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Erreur lors de la mise à jour de la notification",
        error,
      });
  }
}; 

// Marquer toutes les notifications d'un utilisateur comme lues
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.params.userId, isRead: false },
      { isRead: true }
    );

    // Informer les clients connectés que toutes les notifications ont été lues
    socketFunctions.emitAllNotificationsRead(req.params.userId);

    res
      .status(200)
      .json({
        message: `${result.nModified} notifications marquées comme lues`,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Erreur lors de la mise à jour des notifications",
        error,
      });
  }
};

// Supprimer une notification
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(
      req.params.notificationId
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification non trouvée" });
    }

    // Informer les clients connectés que la notification a été supprimée
    socketFunctions.emitNotificationDeleted(
      notification.userId.toString(),
      notification._id
    );

    res.status(200).json({ message: "Notification supprimée avec succès" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Erreur lors de la suppression de la notification",
        error,
      });
  }
};

module.exports = {
  getAllNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  setSocketFunctions,
};
