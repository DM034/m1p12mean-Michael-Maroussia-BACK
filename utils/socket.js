// socket.js
const mongoose = require("mongoose");
const Notification = require("../models/Notification");

module.exports = function (io) {
  if (!io || typeof io.on !== "function") {
    console.error(
      "Erreur: l'instance io n'est pas valide ou la méthode on n'est pas disponible"
    );
    return {
      emitNewNotification: () => {},
      emitNotificationRead: () => {},
      emitAllNotificationsRead: () => {},
      emitNotificationDeleted: () => {},
    };
  }

  console.log("Configuration de Socket.IO...");

  io.on("connection", (socket) => {
    console.log("Nouveau client connecté:", socket.id);

    socket.on("authenticate", async (userId) => {
      if (!userId) {
        console.log("Tentative d'authentification sans userId");
        return;
      }
      
      console.log(`Utilisateur ${userId} authentifié`);
      socket.userId = userId;
      socket.join(userId);

      try {
        const notifications = await Notification.find({
          userId: userId,
          isRead: false,
        }).sort({ createdAt: -1 });
        
        console.log(`Envoi de ${notifications.length} notifications à l'utilisateur ${userId}`);
        socket.emit("unread_notifications", notifications);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des notifications:",
          error
        );
      }
    });

    socket.on("disconnect", () => {
      console.log("Client déconnecté:", socket.id);
    });
  });

  const socketFunctions = {
    emitNewNotification: (userId, notification) => {
      console.log(`Émission d'une nouvelle notification à l'utilisateur ${userId}:`, notification);
      io.to(userId).emit("new_notification", notification);
    },

    emitNotificationRead: (userId, notificationId) => {
      console.log(`Notification ${notificationId} marquée comme lue pour l'utilisateur ${userId}`);
      io.to(userId).emit("notification_read", notificationId);
    },

    emitAllNotificationsRead: (userId) => {
      console.log(`Toutes les notifications de l'utilisateur ${userId} marquées comme lues`);
      io.to(userId).emit("all_notifications_read");
    },

    emitNotificationDeleted: (userId, notificationId) => {
      console.log(`Notification ${notificationId} supprimée pour l'utilisateur ${userId}`);
      io.to(userId).emit("notification_deleted", notificationId);
    },
  };

  return socketFunctions;
};