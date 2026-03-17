const { body, validationResult } = require('express-validator');

// Validation middleware
const validateCampaign = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('fundingGoal').isNumeric().withMessage('Funding goal must be a number'),
  body('deadline').isISO8601().withMessage('Deadline must be a valid date'),
  body('category').isIn(['technology', 'art', 'music', 'film', 'publishing', 'games', 'food', 'fashion', 'community', 'education', 'health', 'environment', 'other']).withMessage('Invalid category'),
  
  // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    next();
  }
];

const validateCampaignUpdate = [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('category').optional().isIn(['technology', 'art', 'music', 'film', 'publishing', 'games', 'food', 'fashion', 'community', 'education', 'health', 'environment', 'other']).withMessage('Invalid category'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    next();
  }
];

const validateUpdate = [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validateCampaign,
  validateCampaignUpdate,
  validateUpdate
};
