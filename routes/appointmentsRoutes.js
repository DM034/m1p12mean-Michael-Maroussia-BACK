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
    assignMechanics
} = require('../controllers/appointmentsController');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth());

router.post('/', createAppointment); 
router.get("/user", auth(), getAppointmentsByUser);
router.put('/:id/assign-mechanics', auth({ roles: ['admin'] }), assignMechanicsToAppointment);
router.put('/:id/validate', validateAppointment); 
router.put('/:id/confirm', confirmAppointment); 
router.put('/appointments/:appointmentId/add-parts', auth({ roles: ['mechanic', 'admin'] }), addPartsToAppointment);
router.put('/:id/complete', completeAppointment); 
router.delete('/:id', deleteAppointment); 
router.get('/', getAppointments); 
router.get('/:id', getAppointmentById); 

module.exports = router;
