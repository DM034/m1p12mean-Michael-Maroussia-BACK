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
router.use(auth());

router.post('/', createAppointment); 
router.put('/:id/validate', validateAppointment); 
router.put('/:id/confirm', confirmAppointment); 
router.put('/:id/complete', completeAppointment); 
router.delete('/:id', deleteAppointment); 
router.get('/', getAppointments); 
router.get('/:id', getAppointmentById); 

module.exports = router;
