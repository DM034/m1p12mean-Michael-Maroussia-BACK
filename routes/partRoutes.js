const express = require('express');
const auth = require('../middleware/auth');
const {
  createPart,
  getParts,
  getPartById,
  updatePart,
  deletePart
} = require('../controllers/partController');

const router = express.Router();

router.post('/', auth({ roles: ['admin'] }), createPart);
router.get('/', auth(), getParts);
router.get('/:id', auth(), getPartById);
router.put('/:id', auth({ roles: ['admin'] }), updatePart);
router.delete('/:id', auth({ roles: ['admin'] }), deletePart);

module.exports = router;
