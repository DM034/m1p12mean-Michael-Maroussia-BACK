const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bodyParser = require('body-parser');
const appointmentRoutes = require('./routes/appointmentsRoutes');
const serviceRoutes = require("./routes/serviceRoutes");
const quoteRoutes = require("./routes/quoteRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const billingRoutes = require("./routes/billingRoutes");
const partRoutes = require("./routes/partRoutes");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));
// app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/part", partRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/billing", billingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
