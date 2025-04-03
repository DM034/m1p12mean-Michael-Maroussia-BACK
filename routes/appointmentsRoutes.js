const express = require('express');
const {
    getAppointmentsByUser,
    createAppointment,
    assignMechanicsToAppointment,
    validateAppointment,
    confirmAppointment,
    addPartsToAppointment,
    completeAppointment,
    deleteAppointment,
    getAppointments,
    getAppointmentById,
    assignMechanics,
    updateAppointment,
    getAppointmentsForMechanic,
    setSocketFunctions
} = require('../controllers/appointmentsController');
const auth = require('../middleware/auth');

const router = express.Router();
let socketFunctions;

// Middleware pour initialiser les fonctions socket
router.use((req, res, next) => {
  // Vérification pour s'assurer que socketFunctions est initialisé
  if (!socketFunctions) {
    // Récupération de l'instance io depuis l'application Express
    const io = req.app.get('io');
    if (io) {
      const socketHandler = require('./../utils/socket');
      socketFunctions = socketHandler(io);
        setSocketFunctions(socketFunctions);
    } else {
      console.error('io n\'est pas disponible dans l\'application Express');
    }
  }
  next();
});

router.use(auth());

router.post('/', createAppointment); 
router.get('/', getAppointments); 
router.get("/user", auth(), getAppointmentsByUser);
router.get("/mechanic", auth(), getAppointmentsForMechanic);
router.put('/:id/assign-mechanics', auth({ roles: ['admin'] }), assignMechanicsToAppointment);
router.put('/:id/validate', validateAppointment); 
router.put('/:id/confirm', confirmAppointment); 
router.put('/appointments/:appointmentId/add-parts', auth({ roles: ['mechanic', 'admin'] }), addPartsToAppointment);
router.put('/:id/complete', completeAppointment); 
router.delete('/:id', deleteAppointment); 
router.get('/:id', getAppointmentById); 
router.put('/:id', updateAppointment);

module.exports = router;
