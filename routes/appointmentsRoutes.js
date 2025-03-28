const express = require('express');
const {
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
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware());

router.post('/', createAppointment); 
router.put('/:id/assign-mechanics', authMiddleware({ roles: ['admin'] }), assignMechanicsToAppointment);
router.put('/:id/assign-mechanics', assignMechanics); 
router.put('/:id/validate', validateAppointment); 
router.put('/:id/confirm', confirmAppointment); 
router.put('/appointments/:appointmentId/add-parts', authMiddleware({ roles: ['mechanic', 'admin'] }), addPartsToAppointment);
router.put('/:id/complete', completeAppointment); 
router.delete('/:id', deleteAppointment); 
router.get('/', getAppointments); 
router.get('/:id', getAppointmentById); 

module.exports = router;
