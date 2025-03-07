const express = require('express');
const {
    createAppointment,
    validateAppointment,
    confirmAppointment,
    completeAppointment,
    deleteAppointment,
    getAppointments,
    getAppointmentById
} = require('../controllers/appointmentsController');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// Routes protégées (JWT obligatoire)
router.post('/', createAppointment); // User
router.put('/:id/validate', validateAppointment); // Admin
router.put('/:id/confirm', confirmAppointment); // Mechanic
router.put('/:id/complete', completeAppointment); // Mechanic
router.delete('/:id', deleteAppointment); // User (si `scheduled`) ou Admin
router.get('/', getAppointments); // Admin
router.get('/:id', getAppointmentById); // User (propres RDV) ou Mechanic (assignés)

module.exports = router;
