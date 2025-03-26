const Part = require('../models/Part');

// 🔧 Création d'une pièce (admin uniquement)
const createPart = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Accès refusé. Seuls les admins peuvent créer une pièce." });
  }

  try {
    const { name, description, price } = req.body;

    const existing = await Part.findOne({ name });
    if (existing) return res.status(400).json({ message: "Cette pièce existe déjà." });

    const part = new Part({ name, description, price });
    await part.save();

    res.status(201).json(part);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📋 Liste de toutes les pièces
const getParts = async (req, res) => {
  try {
    const parts = await Part.find();
    res.status(200).json(parts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔍 Récupération d'une pièce spécifique
const getPartById = async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);
    if (!part) return res.status(404).json({ message: "Pièce non trouvée" });

    res.status(200).json(part);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Mise à jour
const updatePart = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Seuls les admins peuvent modifier une pièce." });
  }

  try {
    const part = await Part.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!part) return res.status(404).json({ message: "Pièce non trouvée" });

    res.status(200).json(part);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ❌ Suppression
const deletePart = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Seuls les admins peuvent supprimer une pièce." });
  }

  try {
    const part = await Part.findByIdAndDelete(req.params.id);
    if (!part) return res.status(404).json({ message: "Pièce non trouvée" });

    res.status(200).json({ message: "Pièce supprimée avec succès." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPart,
  getParts,
  getPartById,
  updatePart,
  deletePart
};
