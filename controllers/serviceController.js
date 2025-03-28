const ServiceType = require("../models/Service");

const createService = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Accès refusé. Seuls les admins peuvent créer un service." });
  }

  try {
    const { name, description, baseCost, defaultDuration, requiredSpecialties } = req.body;
    const newService = new ServiceType({ name, description, baseCost, defaultDuration, requiredSpecialties });

    await newService.save();
    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getServices = async (req, res) => {
  try {
    const services = await ServiceType.find();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await ServiceType.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service non trouvé" });

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateService = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Accès refusé. Seuls les admins peuvent modifier un service." });
  }

  try {
    const service = await ServiceType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) return res.status(404).json({ message: "Service non trouvé" });

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteService = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Accès refusé. Seuls les admins peuvent supprimer un service." });
  }

  try {
    const service = await ServiceType.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: "Service non trouvé" });

    res.status(200).json({ message: "Service supprimé avec succès." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createService, getServices, getServiceById, updateService, deleteService };
