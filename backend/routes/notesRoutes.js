const express = require('express');
const {protect} = require('../middleware/authMiddleware.js');
const notesController = require('../controllers/notesController.js');

const router = express.Router();

router.post('/', protect, notesController.createNotes);
router.get('/', protect, notesController.getNotes);
router.put('/:id', protect, notesController.updateNotes);
router.delete('/:id', protect, notesController.deleteNotes);


module.exports = router;

