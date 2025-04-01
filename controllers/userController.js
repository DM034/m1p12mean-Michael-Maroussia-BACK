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

const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
}

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvée" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvée" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
    try {
      const userId = req.params.id;
  
      const user = await User.findByIdAndUpdate(
        userId,
        { isActive: false },
        { new: true } 
      );
  
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }
  
      res.status(200).json({ message: 'Utilisateur désactivé avec succès.', user });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la désactivation de l\'utilisateur.', error });
    }
  };

const  getAllMechanics =  async (req, res) =>  {
    try {
      const mechanics = await User.find({ role: 'mechanic', isActive: true });
      res.status(200).json(mechanics);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

const   getAllClients =  async (req, res) =>  {
    try {
      const clients = await User.find({ role: 'user', isActive: true });
      res.status(200).json(clients);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

module.exports = { registerMechanic, getUsers,getUserById, updateUser,deleteUser,getAllMechanics,getAllClients };
