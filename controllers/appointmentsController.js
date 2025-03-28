const Appointment = require("../models/Appointment");
const Vehicle = require("../models/Vehicle");
const ServiceType = require("../models/Service");
const Part = require("../models/Part");
const User = require("../models/User");
const Invoice = require("../models/Invoice");

const createAppointment = async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({
      message: "Accès refusé. Seuls les utilisateurs peuvent créer un rendez-vous.",
    });
  }

  try {
    const { vehicleId, services, startTime } = req.body;

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
      status: "scheduled"
    });

    await appointment.save();
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
    const { mechanics } = req.body; // Les mécaniciens assignés sont envoyés dans le body de la requête
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Rendez-vous non trouvé" });
    }

    if (appointment.status !== "scheduled") {
      return res.status(400).json({ message: "Le rendez-vous n'est pas dans un état validable." });
    }

    if (!mechanics || mechanics.length === 0) {
      return res.status(400).json({ message: "Aucun mécanicien fourni pour assignation." });
    }

    // Vérifie si les IDs fournis sont bien des mécaniciens existants
    const validMechanics = await User.find({ _id: { $in: mechanics }, role: 'mechanic' });

    if (validMechanics.length === 0) {
      return res.status(400).json({ message: "Aucun mécanicien valide trouvé pour assignation." });
    }

    // Assigne les mécaniciens au rendez-vous
    appointment.mechanics = validMechanics.map(mech => mech._id);
    appointment.status = "validated";
    await appointment.save();

    res.status(200).json({ message: "Rendez-vous validé avec mécaniciens assignés.", appointment });
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
    const { startTime, endTime, partsUsed } = req.body;

    const appointment = await Appointment.findById(req.params.id)
      .populate("clientId")
      .populate("services.serviceType")
      .populate("partsUsed.part");

    if (!appointment) return res.status(404).json({ message: "Rendez-vous non trouvé" });

    if (appointment.status !== "in_progress") {
      return res.status(400).json({ message: "Le rendez-vous n'est pas en cours." });
    }

    if (!startTime || !endTime) {
      return res.status(400).json({ message: "Veuillez fournir une date de début et une date de fin." });
    }

    // ✅ Mise à jour du statut, de la date de fin et de la date de début
    appointment.status = "completed";
    appointment.startTime = new Date(startTime);
    appointment.endTime = new Date(endTime);

    // ✅ Ajout des `partsUsed` fournies par le mécanicien
    if (Array.isArray(partsUsed) && partsUsed.length > 0) {
      for (const partItem of partsUsed) {
        const part = await Part.findById(partItem.part);

        if (!part) {
          return res.status(404).json({ message: `Pièce introuvable pour l'ID ${partItem.part}` });
        }

        const quantity = partItem.quantity || 1;
        const unitPrice = part.price;
        const totalPrice = unitPrice * quantity;

        appointment.partsUsed.push({
          part: part._id,
          quantity: quantity,
          unitPrice: unitPrice,
          totalPrice: totalPrice
        });
      }
    }

    await appointment.save();

    // ✅ Génération de la facture
    const items = [];
    let subtotal = 0;

    // Ajouter les services à la facture
    for (let s of appointment.services) {
      const cost = s.estimatedCost || s.serviceType?.baseCost || 0;
      items.push({
        type: "service",
        description: s.serviceType.name,
        quantity: 1,
        unitPrice: cost,
        total: cost
      });
      subtotal += cost;
    }

    // Ajouter les pièces utilisées à la facture
    for (let p of appointment.partsUsed || []) {
      const total = p.unitPrice * p.quantity;
      items.push({
        type: "part",
        description: p.part.name,
        quantity: p.quantity,
        unitPrice: p.unitPrice,
        total: total
      });
      subtotal += total;
    }

    const taxRate = 0.2;
    const totalAmount = subtotal * (1 + taxRate);

    const invoice = new Invoice({
      appointmentId: appointment._id,
      clientId: appointment.clientId._id,
      invoiceNumber: `INV-${appointment._id}`,
      items,
      subtotal,
      taxRate,
      totalAmount,
      status: 'issued'
    });

    await invoice.save();

    res.status(200).json({
      message: "Rendez-vous terminé et facture générée.",
      appointment,
      invoice
    });

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
  addPartsToAppointment,
  completeAppointment,
  deleteAppointment,
  getAppointments,
  getAppointmentById
};
