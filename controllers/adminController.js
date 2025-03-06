const User = require("../models/User");

const updateUserRole = async (req, res) => {
  const { userId, role } = req.body;

  try {
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Rôle invalide" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    user.role = role;
    await user.save();

    res.json({ message: "Rôle mis à jour avec succès", data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { updateUserRole };