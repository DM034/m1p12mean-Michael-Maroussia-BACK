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
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const http = require('http');
const { Server } = require('socket.io');
const socketHandler = require('./utils/socket');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Remplacer par ton domaine en production
    methods: ["GET", "POST"]
  }
});

// Attacher l'instance de Socket.IO à l'application
app.set('io', io);

app.use(express.json());
app.use(cors({
  origin: [
    'https://m1p12mean-michael-maroussia-garage.vercel.app', 
    'http://localhost:4200'
  ],
  credentials: true
}));
app.use(morgan('dev'));

// Initialise Socket.IO
socketHandler(io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/parts", partRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/users", userRoutes);
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
