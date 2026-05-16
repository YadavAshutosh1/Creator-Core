const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');
const { protect } = require('../middleware/auth.middleware');

// Transcript & Generation
router.post('/transcript', protect, contentController.extractTranscript);
router.post('/generate', protect, contentController.generateContent);

// Persistent Vault
router.get('/vault', protect, contentController.getUserContent);
router.post('/save', protect, contentController.saveContent);
router.delete('/:id', protect, contentController.deleteContent);

module.exports = router;
