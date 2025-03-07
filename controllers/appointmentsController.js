const Appointment = require("../models/Appointment");

// 📌 Créer un rendez-vous (Seul un 'user' peut créer un RDV)
const createAppointment = async (req, res) => {
    console.log('eto');
    if (req.user.role !== 'user') {
        return res.status(403).json({ message: "Accès refusé. Seuls les utilisateurs peuvent créer un rendez-vous." });
    }

    try {
        const { carModel, licensePlate, serviceType, appointmentDate } = req.body;
        const newAppointment = new Appointment({
            customerName: req.user.name,
            carModel,
            licensePlate,
            serviceType,
            appointmentDate,
            status: "pending" // En attente de validation par un admin
        });

        await newAppointment.save();
        res.status(201).json(newAppointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 📌 Valider un rendez-vous (Seul un admin peut passer de pending à scheduled)
const validateAppointment = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Seul un admin peut valider un rendez-vous." });
    }

    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: "Rendez-vous non trouvé" });

        if (appointment.status !== "pending") {
            return res.status(400).json({ message: "Ce rendez-vous a déjà été validé." });
        }

        appointment.status = "scheduled";
        await appointment.save();

        res.status(200).json({ message: "Rendez-vous validé.", appointment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 📌 Confirmer un rendez-vous (Seul un mécanicien peut passer de scheduled à in-progress)
const confirmAppointment = async (req, res) => {
    if (req.user.role !== 'mechanic') {
        return res.status(403).json({ message: "Seul un mécanicien peut confirmer un rendez-vous." });
    }

    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: "Rendez-vous non trouvé" });

        if (appointment.status !== "scheduled") {
            return res.status(400).json({ message: "Seuls les rendez-vous validés peuvent être confirmés." });
        }

        appointment.status = "in-progress";
        await appointment.save();

        res.status(200).json({ message: "Rendez-vous confirmé par le mécanicien.", appointment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 📌 Finaliser un rendez-vous (Le mécanicien passe de in-progress à completed)
const completeAppointment = async (req, res) => {
    if (req.user.role !== 'mechanic') {
        return res.status(403).json({ message: "Seul un mécanicien peut terminer un rendez-vous." });
    }

    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: "Rendez-vous non trouvé" });

        if (appointment.status !== "in-progress") {
            return res.status(400).json({ message: "Seuls les rendez-vous en cours peuvent être finalisés." });
        }

        appointment.status = "completed";
        await appointment.save();

        res.status(200).json({ message: "Rendez-vous terminé.", appointment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 📌 Suppression d'un rendez-vous (Client peut annuler uniquement si status = scheduled)
const deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: "Rendez-vous non trouvé" });

        if (req.user.role === 'user' && appointment.status !== 'scheduled') {
            return res.status(403).json({ message: "Vous ne pouvez annuler que les rendez-vous en attente." });
        }

        if (req.user.role !== 'admin' && req.user.role !== 'user') {
            return res.status(403).json({ message: "Seuls un admin ou le client peuvent annuler un rendez-vous." });
        }

        await Appointment.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Rendez-vous annulé." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 📌 Récupérer tous les rendez-vous (Admin uniquement)
const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find();
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 📌 Récupérer un rendez-vous spécifique (Client = propres RDV, Mécanicien = assignés, Admin = tout)
const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: "Rendez-vous non trouvé" });

        if (req.user.role === 'user' && appointment.customerName !== req.user.name) {
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
    getAppointmentById
};
