const Appointment = require("../models/Appointment");
const ServiceType = require("../models/ServiceType");
const Part = require("../models/Part");
const User = require("../models/User");

const createInvoiceFromAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId)
      .populate("vehicleId clientId services.serviceType partsUsed.part");

    if (!appointment) {
      return res.status(404).json({ message: "Rendez-vous introuvable" });
    }

    // Vérifie si une facture existe déjà pour ce rendez-vous
    const existingInvoice = await Invoice.findOne({ appointmentId });
    if (existingInvoice) {
      return res.status(400).json({ message: "Une facture existe déjà pour ce rendez-vous." });
    }

    const client = await User.findById(appointment.clientId);
    if (!client) {
      return res.status(404).json({ message: "Client introuvable" });
    }

    let items = [];
    let subtotal = 0;

    // Services
    for (const item of appointment.services) {
      const service = await ServiceType.findById(item.serviceType);
      if (service) {
        const total = item.estimatedCost || service.baseCost;
        subtotal += total;
        items.push({
          type: "service",
          description: service.name,
          quantity: 1,
          unitPrice: total,
          total: total
        });
      }
    }

    // Pièces
    for (const partItem of appointment.partsUsed || []) {
      const part = await Part.findById(partItem.part);
      if (part) {
        const total = part.price * partItem.quantity;
        subtotal += total;
        items.push({
          type: "part",
          description: part.name,
          quantity: partItem.quantity,
          unitPrice: part.price,
          total: total
        });
      }
    }

    const taxRate = 0.2;
    const totalAmount = subtotal * (1 + taxRate);

    const newInvoice = new Invoice({
      appointmentId,
      clientId: appointment.clientId,
      invoiceNumber: `INV-${appointment._id}`,
      items,
      subtotal,
      taxRate,
      totalAmount,
      status: "issued"
    });

    await newInvoice.save();
    res.status(201).json(newInvoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createInvoiceFromAppointment };
