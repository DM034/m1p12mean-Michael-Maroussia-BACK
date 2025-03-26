const Vehicle = require("../models/Vehicle");

const addVehicle = async (req, res) => {
    if (!req.user || req.user.role !== "user") {
        return res.status(403).json({ message: "Seuls les utilisateurs peuvent ajouter un véhicule." });
    }

    try {
        const { make, model, year, licensePlate, technicalDetails } = req.body;

        const existingVehicle = await Vehicle.findOne({ licensePlate });
        if (existingVehicle) {
            return res.status(400).json({ message: "Ce numéro d'immatriculation est déjà enregistré." });
        }

        const newVehicle = new Vehicle({
            userId: req.user.id,
            make,
            model,
            year,
            licensePlate,
            technicalDetails
        });

        await newVehicle.save();
        res.status(201).json(newVehicle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserVehicles = async (req, res) => {
    if (!req.user) {
        return res.status(403).json({ message: "Accès refusé." });
    }

    try {
        const vehicles = await Vehicle.find({ userId: req.user.id }); // ✅ Correction
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ message: "Véhicule introuvable." });

        if (vehicle.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Vous ne pouvez supprimer que vos propres véhicules." });
        }

        await Vehicle.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Véhicule supprimé avec succès." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addVehicle, getUserVehicles, deleteVehicle };
