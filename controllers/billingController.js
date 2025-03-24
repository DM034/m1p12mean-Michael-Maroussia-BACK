const Appointment = require("../models/Appointment");
const Service = require("../models/Service");
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");

const getInvoiceByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId)
      .populate("vehicleId")
      .populate("serviceId");

    if (!appointment) {
      return res.status(404).json({ message: "Rendez-vous introuvable" });
    }

    const user = await User.findById(appointment.user);
    console.log("RDV récupéré :", appointment);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    let servicesList = [];
    let total = 0;

    if (appointment.serviceId) {
      const service = await Service.findById(appointment.serviceId);
      if (service) {
        servicesList.push({
          name: service.name,
          price: service.price
        });
        total += service.price;
      }
    } else if (appointment.services && Array.isArray(appointment.services)) {
      for (const item of appointment.services) {
        const service = await Service.findById(item.service);
        if (service) {
          const qty = item.quantity || 1;
          servicesList.push({
            name: service.name,
            unitPrice: service.price,
            quantity: qty,
            total: service.price * qty
          });
          total += service.price * qty;
        }
      }
    }

    const invoice = {
      invoiceId: `INV-${appointment._id}`,
      client: user.name,
      email: user.email,
      vehicle: {
        model: appointment.carModel || appointment.vehicleId?.model,
        licensePlate: appointment.licensePlate || appointment.vehicleId?.licensePlate
      },
      appointmentDate: appointment.appointmentDate,
      services: servicesList,
      totalAmount: total,
      status: appointment.status
    };

    res.status(200).json(invoice);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getInvoiceByAppointment };
