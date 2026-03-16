const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const auth = require('../middleware/auth');
const { validateCampaign, validateCampaignUpdate, validateUpdate } = require('../middleware/validation');

// Public routes
router.get('/', campaignController.getCampaigns);
router.get('/featured', campaignController.getCampaigns);
router.get('/search', campaignController.getCampaigns);
router.get('/:identifier', campaignController.getCampaign);
router.get('/:identifier/stats', campaignController.getCampaignStats);

// Protected routes (require authentication)
router.post('/', auth, validateCampaign, campaignController.createCampaign);
router.put('/:id', auth, validateCampaignUpdate, campaignController.updateCampaign);
router.delete('/:id', auth, campaignController.deleteCampaign);
router.post('/:id/updates', auth, validateUpdate, campaignController.addUpdate);

module.exports = router;
