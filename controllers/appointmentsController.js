const Appointment = require("../models/Appointment");
const Vehicle = require("../models/Vehicle");
const ServiceType = require("../models/ServiceType");
const Part = require("../models/Part");
const User = require("../models/User");
const Invoice = require("../models/Invoice");
const Notification = require("../models/Notification");
const io = require('../utils/socket');

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

const getAppointmentsByUser = async (req, res) => {
  try {
      const userId = req.user.id; // L'utilisateur connecté

      const appointments = await Appointment.find({ clientId: userId })
      .populate({ path: "mechanics", select: "profile specialties _id" });

      res.status(200).json(appointments);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

const getAppointmentsForMechanic = async (req, res) => {
  try {
    const mechanicId = req.user.id;
    if (!mechanicId) {
      return res.status(400).json({ message: "L'ID du mécanicien est requis" });
    }
    // Récupération des rendez-vous où le mécanicien est assigné
    const appointments = await Appointment.find({ mechanics: mechanicId })
      .populate('clientId', 'email profile')       // Adapter les champs à afficher pour le client
      .populate('vehicleId')                        // Récupération des informations du véhicule
      .populate('mechanics', 'profile')             // Récupération des infos des mécaniciens
      .populate('services.serviceType')             // Récupération des infos sur le type de service
      .populate('partsUsed.part');                  // Récupération des infos sur les pièces utilisées

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAppointment = async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({
      message: "Accès refusé. Seuls les utilisateurs peuvent créer un rendez-vous.",
    });
  }

  try {
    const { vehicleId, services, startTime, notes } = req.body;
    const io = req.app.get('io'); 

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Véhicule non trouvé" });
    }

    let totalEstimatedCost = 0;
    const enrichedServices = [];

    for (const item of services) {
      const serviceType = await ServiceType.findById(item.serviceType);
      if (!serviceType) {
        return res.status(404).json({ message: `Service introuvable : ${item.serviceType}` });
      }

      const estimatedDuration = serviceType.defaultDuration || 1;
      const estimatedCost = serviceType.baseCost || 0;

      totalEstimatedCost += estimatedCost;

      enrichedServices.push({
        serviceType: serviceType._id,
        estimatedDuration,
        estimatedCost
      });
    }

    const appointment = new Appointment({
      clientId: req.user.id,
      vehicleId,
      services: enrichedServices,
      totalEstimatedCost,
      startTime,
      status: "scheduled",
      notes
    });

    await appointment.save();

    const clientNotification = new Notification({
      userId: req.user.id,
      message: "Votre rendez-vous a été créé avec succès.",
      link:"/client/appointment"
    });
    const savedClientNotification = await clientNotification.save();
    socketFunctions.emitNewNotification(req.user.id, savedClientNotification);

    const admins = await User.find({ role: "admin" });
    admins.forEach(async (admin) => {
      const notification = new Notification({
        userId: admin._id,
        message: "Nouveau rendez-vous créé par un client.",
        link:"/admin/planning-management"

      });
      const savedNotification = await notification.save();
      socketFunctions.emitNewNotification(admin.id.toString(), savedNotification);
    });

    res.status(201).json({ message: "Rendez-vous créé", appointment });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const assignMechanicsToAppointment = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Seul un admin peut assigner des mécaniciens." });
  }

  try {
    const { mechanics } = req.body; // tableau d'IDs de mécaniciens
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) return res.status(404).json({ message: "Rendez-vous non trouvé" });

    if (appointment.status !== "scheduled") {
      return res.status(400).json({ message: "Le rendez-vous ne peut plus être modifié." });
    }

    // Vérification des rôles des mécaniciens
    const validMechanics = await User.find({ _id: { $in: mechanics }, role: "mechanic" });
    if (validMechanics.length !== mechanics.length) {
      return res.status(400).json({ message: "Certains IDs ne sont pas des mécaniciens valides." });
    }

    appointment.mechanics = mechanics;
    await appointment.save();

    res.status(200).json({ message: "Mécaniciens assignés avec succès.", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const assignMechanics = async (req, res) => {
  try {
    const { id } = req.params;
    const { mechanics } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Rendez-vous non trouvé." });
    }

    appointment.assignedMechanics = mechanics;
    await appointment.save();

    res.status(200).json({ message: "Mécaniciens assignés.", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const validateAppointment = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Seul un admin peut valider un rendez-vous." });
  }

  try {
    const { mechanics } = req.body; 
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Rendez-vous non trouvé" });
    }

    if (!mechanics || mechanics.length === 0) {
      return res.status(400).json({ message: "Aucun mécanicien fourni pour assignation." });
    }

    appointment.mechanics = mechanics;
    appointment.status = "validated";
    await appointment.save();

    // 🔔 Notification aux mécaniciens assignés
    mechanics.forEach(async (mechanicId) => {
      const notification = new Notification({
        userId: mechanicId,
        message: "Vous avez été assigné à un nouveau rendez-vous."
      });
      await notification.save();
      io.getIO().to(mechanicId.toString()).emit('notification', notification);
    });

    res.status(200).json({ message: "Rendez-vous validé", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const confirmAppointment = async (req, res) => {
  if (req.user.role !== "mechanic") {
    return res.status(403).json({ message: "Seul un mécanicien peut confirmer un rendez-vous." });
  }

  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Rendez-vous non trouvé" });

    appointment.status = "in_progress";
    await appointment.save();

    // 🔔 Notification au client
    const notification = new Notification({
      userId: appointment.clientId,
      message: "Votre rendez-vous est en cours de traitement."
    });
    await notification.save();
    io.getIO().to(appointment.clientId.toString()).emit('notification', notification);

    res.status(200).json({ message: "Rendez-vous confirmé", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addPartsToAppointment = async (req, res) => {
  if (req.user.role !== "mechanic" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Seul un mécanicien ou admin peut ajouter des pièces." });
  }

  try {
    const { appointmentId } = req.params;   
    const { parts } = req.body; // [{ partId, quantity }]

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Rendez-vous non trouvé." });
    }

    let totalParts = [];

    for (const item of parts) {
      const part = await Part.findById(item.partId);
      if (!part) {
        return res.status(404).json({ message: `Pièce avec l'ID ${item.partId} introuvable.` });
      }

      const quantity = item.quantity || 1;
      const unitPrice = part.price;
      const totalPrice = unitPrice * quantity;

      totalParts.push({
        part: part._id,
        quantity,
        unitPrice,
        totalPrice
      });
    }

    appointment.partsUsed.push(...totalParts);
    await appointment.save();

    res.status(200).json({ message: "Pièces ajoutées avec succès.", partsUsed: appointment.partsUsed });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const completeAppointment = async (req, res) => {
  if (req.user.role !== "mechanic") {
    return res.status(403).json({ message: "Seul un mécanicien peut finaliser un rendez-vous." });
  }

  try {
    const { startTime, endTime, partsUsed } = req.body;

    const appointment = await Appointment.findById(req.params.id)
      .populate("clientId")
      .populate("services.serviceType")
      .populate("partsUsed.part");

    if (!appointment) return res.status(404).json({ message: "Rendez-vous non trouvé" });

    appointment.status = "completed";
    appointment.startTime = new Date(startTime);
    appointment.endTime = new Date(endTime);
    await appointment.save();

    // 🔔 Notification au client
    const notification = new Notification({
      userId: appointment.clientId,
      message: "Votre rendez-vous a été terminé."
    });
    await notification.save();
    io.getIO().to(appointment.clientId.toString()).emit('notification', notification);

    res.status(200).json({ message: "Rendez-vous terminé", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Rendez-vous non trouvé" });

    if (req.user.role === "user" && appointment.clientId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Vous ne pouvez supprimer que vos propres rendez-vous." });
    }

    if (req.user.role === "user" && appointment.status !== "scheduled") {
      return res.status(403).json({ message: "Vous ne pouvez annuler que les rendez-vous non validés." });
    }

    await appointment.deleteOne();
    res.status(200).json({ message: "Rendez-vous supprimé." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("vehicleId", "make model licensePlate")
      .populate("clientId", "email profile.firstName profile.lastName")
      .populate("mechanics", "email profile.firstName profile.lastName")
      .populate("services.serviceType", "name basePrice");

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("vehicleId")
      .populate("clientId", "email profile")
      .populate("mechanics", "profile")
      .populate("services.serviceType", "name");

    if (!appointment) return res.status(404).json({ message: "Rendez-vous non trouvé." });

    if (req.user.role === "user" && appointment.clientId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Accès interdit." });
    }

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
      const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!appointment) return res.status(404).json({ message: "Rendez-vous non trouvée" });
      res.status(200).json(appointment);
  } catch (error) {
          res.status(500).json({ error: error });
  }
}

module.exports = {
  getAppointmentsByUser,
  createAppointment,
  assignMechanicsToAppointment,
  validateAppointment,
  confirmAppointment,
  completeAppointment,
  deleteAppointment,
  getAppointments,
  getAppointmentById,
  assignMechanics,
  addPartsToAppointment,
  updateAppointment,
  getAppointmentsForMechanic,
  setSocketFunctions
};
