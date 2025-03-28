const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerMechanic = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Accès refusé. Seul un admin peut créer un mécanicien." });
    }

    const { email, password, profile, specialties, hourlyRate } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Un utilisateur avec cet email existe déjà." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newMechanic = new User({
            email,
            password: hashedPassword,
            role: 'mechanic',
            profile,
            specialties,
            hourlyRate
        });

        await newMechanic.save();
        res.status(201).json({ message: "Mécanicien créé avec succès", newMechanic });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerMechanic };
