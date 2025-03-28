const Appointment = require("../models/Appointment");
const Vehicle = require("../models/Vehicle");
const ServiceType = require("../models/ServiceType");
const Part = require("../models/Part");

const createAppointment = async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "Seuls les clients peuvent créer un rendez-vous." });
  }

  try {
    const { vehicleId, services, startTime, notes } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Véhicule non trouvé." });
    }

    let totalEstimatedCost = 0;
    const populatedServices = [];

    for (const s of services) {
      const service = await ServiceType.findById(s.serviceType);
      if (!service) {
        return res.status(404).json({ message: `Service introuvable pour ID ${s.serviceType}` });
      }

      const duration = s.estimatedDuration || service.defaultDuration || 1; // fallback
      const cost = s.estimatedCost || service.basePrice || 0;

      populatedServices.push({
        serviceType: service._id,
        estimatedDuration: duration,
        estimatedCost: cost
      });

      totalEstimatedCost += cost;
    }

    const appointment = new Appointment({
      clientId: req.user.id,
      vehicleId,
      startTime,
      status: "scheduled",
      services: populatedServices,
      totalEstimatedCost,
      notes
    });

    await appointment.save();
    res.status(201).json({ message: "Rendez-vous créé.", appointment });
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
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Rendez-vous non trouvé" });

    if (appointment.status !== "scheduled") {
      return res.status(400).json({ message: "Le rendez-vous n'est pas dans un état validable." });
    }

    if (!appointment.mechanics || appointment.mechanics.length === 0) {
      return res.status(400).json({ message: "Aucun mécanicien assigné à ce rendez-vous." });
    }

    appointment.status = "validated";
    await appointment.save();

    res.status(200).json({ message: "Rendez-vous validé.", appointment });
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

    if (appointment.status !== "validated") {
      return res.status(400).json({ message: "Le rendez-vous n'est pas encore validé par l'admin." });
    }

    if (!appointment.mechanics.includes(req.user.id)) {
      return res.status(403).json({ message: "Vous n'êtes pas assigné à ce rendez-vous." });
    }

    appointment.status = "in_progress";
    await appointment.save();

    res.status(200).json({ message: "Rendez-vous confirmé par le mécanicien.", appointment });
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
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Rendez-vous non trouvé" });

    if (appointment.status !== "in_progress") {
      return res.status(400).json({ message: "Le rendez-vous n'est pas en cours." });
    }

    appointment.status = "completed";
    appointment.endTime = new Date();
    await appointment.save();

    res.status(200).json({ message: "Rendez-vous terminé.", appointment });
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

module.exports = {
  createAppointment,
  assignMechanicsToAppointment,
  validateAppointment,
  confirmAppointment,
  completeAppointment,
  deleteAppointment,
  getAppointments,
  getAppointmentById,
  assignMechanics,
  addPartsToAppointment
};
