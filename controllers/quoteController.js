const Quote = require("../models/Quote");
const Service = require("../models/Service");

const createQuote = async (req, res) => {
    if (!req.user || req.user.role !== "user") {
        return res.status(403).json({ message: "Seuls les utilisateurs peuvent demander un devis." });
    }

    try {
        const { vehicleId, services } = req.body;

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle || vehicle.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Ce véhicule ne vous appartient pas." });
        }

        let totalPrice = 0;
        const serviceDetails = [];

        for (let item of services) {
            const service = await Service.findById(item.service);
            if (!service) return res.status(404).json({ message: "Service introuvable." });

            totalPrice += service.price * (item.quantity || 1);
            serviceDetails.push({ service: service._id, quantity: item.quantity || 1 });
        }

        const newQuote = new Quote({
            user: req.user.id,
            vehicle: vehicle._id, // Associe le véhicule au devis
            services: serviceDetails,
            totalPrice,
            status: "pending"
        });

        await newQuote.save();
        res.status(201).json(newQuote);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserQuotes = async (req, res) => {
    if (!req.user) {
        return res.status(403).json({ message: "Accès refusé." });
    }

    try {
        const quotes = await Quote.find({ user: req.user.id }).populate("services.service");
        res.status(200).json(quotes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const confirmQuote = async (req, res) => {
    if (!req.user || req.user.role !== "user") {
        return res.status(403).json({ message: "Seuls les utilisateurs peuvent confirmer un devis." });
    }

    try {
        const quote = await Quote.findById(req.params.id).populate("services.service");
        if (!quote) return res.status(404).json({ message: "Devis introuvable." });

        if (quote.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Vous ne pouvez confirmer que vos propres devis." });
        }

        quote.status = "confirmed";
        await quote.save();

        res.status(200).json({ message: "Devis confirmé, vous pouvez maintenant prendre rendez-vous.", quote });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteQuote = async (req, res) => {
    try {
        const quote = await Quote.findById(req.params.id);
        if (!quote) return res.status(404).json({ message: "Devis introuvable." });

        if (quote.status !== "pending") {
            return res.status(400).json({ message: "Vous ne pouvez supprimer qu'un devis en attente." });
        }

        await Quote.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Devis supprimé avec succès." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createQuote, getUserQuotes, confirmQuote, deleteQuote };
