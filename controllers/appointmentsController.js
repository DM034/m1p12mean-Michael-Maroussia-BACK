const Appointment = require("../models/Appointment");
const Vehicle = require("../models/Vehicle");
const Service = require("../models/Service");

const createAppointment = async (req, res) => {
  if (req.user.role !== "user") {
    return res
      .status(403)
      .json({
        message:
          "Accès refusé. Seuls les utilisateurs peuvent créer un rendez-vous.",
      });
  }

  try {
    const { vehicleId, serviceId, appointmentDate } = req.body;
    const service = await Service.findById(serviceId);
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Véhicule non trouvé" });
    }
    const newAppointment = new Appointment({
      user: req.user.id,
      customerName: req.user.name,
      vehicleId,
      serviceId,
      serviceType: service.name, 
      carModel: vehicle.model, 
      licensePlate: vehicle.licensePlate,
      appointmentDate,
      status: "pending",
    });

    await newAppointment.save();
    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const validateAppointment = async (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Seul un admin peut valider un rendez-vous." });
  }

  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: "Rendez-vous non trouvé" });

    if (appointment.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Ce rendez-vous a déjà été validé." });
    }

    appointment.status = "scheduled";
    await appointment.save();

    res.status(200).json({ message: "Rendez-vous validé.", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const confirmAppointment = async (req, res) => {
  if (req.user.role !== "mechanic") {
    return res
      .status(403)
      .json({ message: "Seul un mécanicien peut confirmer un rendez-vous." });
  }

  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: "Rendez-vous non trouvé" });

    if (appointment.status !== "scheduled") {
      return res
        .status(400)
        .json({
          message: "Seuls les rendez-vous validés peuvent être confirmés.",
        });
    }

    appointment.status = "in-progress";
    await appointment.save();

    res
      .status(200)
      .json({
        message: "Rendez-vous confirmé par le mécanicien.",
        appointment,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const completeAppointment = async (req, res) => {
  if (req.user.role !== "mechanic") {
    return res
      .status(403)
      .json({ message: "Seul un mécanicien peut terminer un rendez-vous." });
  }

  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: "Rendez-vous non trouvé" });

    if (appointment.status !== "in-progress") {
      return res
        .status(400)
        .json({
          message: "Seuls les rendez-vous en cours peuvent être finalisés.",
        });
    }

    appointment.status = "completed";
    await appointment.save();

    res.status(200).json({ message: "Rendez-vous terminé.", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: "Rendez-vous non trouvé" });

    if (req.user.role === "user" && appointment.status !== "scheduled") {
      return res
        .status(403)
        .json({
          message: "Vous ne pouvez annuler que les rendez-vous en attente.",
        });
    }

    if (req.user.role !== "admin" && req.user.role !== "user") {
      return res
        .status(403)
        .json({
          message:
            "Seuls un admin ou le client peuvent annuler un rendez-vous.",
        });
    }

    await Appointment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Rendez-vous annulé." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: "Rendez-vous non trouvé" });

    if (
      req.user.role === "user" &&
      appointment.customerName !== req.user.name
    ) {
      return res.status(403).json({ message: "Accès refusé." });
    }

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAppointment,
  validateAppointment,
  confirmAppointment,
  completeAppointment,
  deleteAppointment,
  getAppointments,
  getAppointmentById,
};
