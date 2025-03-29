const Appointment = require("../models/Appointment");
const ServiceType = require("../models/ServiceType");
const Part = require("../models/Part");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");

const getInvoiceByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId)
      .populate("vehicleId clientId services.serviceType partsUsed.part");

    if (!appointment) {
      return res.status(404).json({ message: "Rendez-vous introuvable" });
    }

    const user = await User.findById(appointment.clientId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    let items = [];
    let subtotal = 0;

    for (let item of appointment.services) {
      const service = await ServiceType.findById(item.serviceType);
      if (service) {
        const total = item.estimatedCost || service.baseCost;
        subtotal += total;
        items.push({
          type: 'service',
          description: service.name,
          quantity: 1,
          unitPrice: total,
          total: total
        });
      }
    }

    for (let partItem of appointment.partsUsed || []) {
      const part = await Part.findById(partItem.part);
      if (part) {
        const total = part.price * partItem.quantity;
        subtotal += total;
        items.push({
          type: 'part',
          description: part.name,
          quantity: partItem.quantity,
          unitPrice: part.price,
          total: total
        });
      }
    }

    const taxRate = 0.2; // 20% TVA
    const totalAmount = subtotal * (1 + taxRate);

    const invoice = {
      invoiceNumber: `INV-${appointment._id}`,
      client: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`,
      email: user.email,
      vehicle: {
        model: appointment.vehicleId?.model,
        licensePlate: appointment.vehicleId?.licensePlate
      },
      appointmentDate: appointment.startTime,
      items,
      subtotal,
      taxRate,
      totalAmount,
      status: 'issued'
    };

    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getInvoiceByAppointment };
