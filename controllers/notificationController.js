const Notification = require('../models/Notification');

// ✅ Récupérer les notifications de l'utilisateur connecté
const getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Marquer une notification comme lue
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.notificationId, 
            { read: true }, 
            { new: true }
        );
        if (!notification) return res.status(404).json({ message: "Notification introuvable" });
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Envoyer une notification
const sendNotification = async (req, res) => {
    try {
        const { userId, message } = req.body;
        const newNotification = new Notification({ userId, message });
        await newNotification.save();
        res.status(201).json(newNotification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUserNotifications, markAsRead, sendNotification };
