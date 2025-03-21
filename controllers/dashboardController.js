const Service = require("../models/Service");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");



const getDashboardStats = async (req, res) => {
  try {
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: "pending" });
    const inProgressAppointments = await Appointment.countDocuments({ status: "in-progress" });
    const completedAppointments = await Appointment.countDocuments({ status: "completed" });
    const totalClients = await User.countDocuments({ role: "user" });
    const totalVehicles = await Vehicle.countDocuments();

    const scheduledAppointments = await Appointment.find({ status: { $ne: "pending" } });

    let totalRevenue = 0;

    for (let rdv of scheduledAppointments) {
      if (rdv.serviceId) {
        const service = await Service.findById(rdv.serviceId);
        if (service) {
          totalRevenue += service.price;
        }
      } else if (rdv.serviceType) {
        const service = await Service.findOne({ name: rdv.serviceType });
        if (service) {
          totalRevenue += service.price;
        }
      }
    }

    const recentAppointments = await Appointment.find()
      .sort({ appointmentDate: -1 })
      .limit(5)
      .populate("vehicleId serviceId", "licensePlate model name");

    res.status(200).json({
      totalAppointments,
      pendingAppointments,
      inProgressAppointments,
      completedAppointments,
      totalRevenue,
      totalClients,
      totalVehicles,
      recentAppointments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    getDashboardStats
  };