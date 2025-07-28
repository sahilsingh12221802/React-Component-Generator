const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation failed for:', req.path);
    console.log('Request body:', req.body);
    console.log('Validation errors:', errors.array());
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
      receivedData: req.body
    });
  }
  next();
};

const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword')
    .optional()
    .custom((value, { req }) => {
      if (value && value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateSession = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  handleValidationErrors
];

const validateAIPrompt = [
  body('prompt')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Prompt must be between 1 and 2000 characters'),
  body('sessionId')
    .optional()
    .isMongoId()
    .withMessage('Invalid session ID'),
  body('context')
    .optional()
    .isObject()
    .withMessage('Context must be an object'),
  handleValidationErrors
];

const validateComponentUpdate = [
  body('jsx')
    .optional()
    .isString()
    .withMessage('JSX must be a string'),
  body('css')
    .optional()
    .isString()
    .withMessage('CSS must be a string'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validateSession,
  validateAIPrompt,
  validateComponentUpdate
}; 