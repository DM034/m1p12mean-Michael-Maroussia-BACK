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

    // ✅ Ajout : CA du mois actuel pour revenueData
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const appointmentsThisMonth = await Appointment.find({
      status: { $ne: "pending" },
      appointmentDate: {
        $gte: new Date(currentYear, currentMonth, 1),
        $lte: new Date(currentYear, currentMonth + 1, 0)
      }
    }).populate("serviceId");

    const caDuMois = appointmentsThisMonth.reduce((total, a) => {
      return total + (a.serviceId?.price || 0);
    }, 0);

    // ✅ Ajout : Répartition des services (pour pie chart)
    const allAppointments = await Appointment.find().populate("serviceId");
    const serviceTypeCount = {};
    for (let a of allAppointments) {
      const name = a.serviceId?.name || a.serviceType;
      if (name) {
        serviceTypeCount[name] = (serviceTypeCount[name] || 0) + 1;
      }
    }

    const serviceTypeData = {
      labels: Object.keys(serviceTypeCount),
      datasets: [{ data: Object.values(serviceTypeCount) }]
    };

    // ✅ Ajout : rendez-vous du jour
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const todayAppointments = await Appointment.find({
      appointmentDate: { $gte: startOfDay, $lte: endOfDay }
    }).populate("vehicleId serviceId user", "model licensePlate name email");

    // ✅ Déjà présent
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
      recentAppointments,
      caDuMois,               // ✅ pour remplacer valeur statique dans statsCards
      serviceTypeData,        // ✅ pour pie chart
      todayAppointments       // ✅ pour affichage dynamique des cartes du jour
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats
};
