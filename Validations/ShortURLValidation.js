const { body, param, validationResult } = require('express-validator');

const validationRulesMap = {
  shortenURL: [
    body('longURL').notEmpty().isURL().withMessage('Invalid URL format'),
    body('customShortCode').notEmpty().isAlphanumeric().withMessage('Short code must be alphanumeric'),
  ],
  redirect: [
    param('shortCode').notEmpty().isAlphanumeric().withMessage('Short code must be alphanumeric'),
  ],
  update: [
    param('shortURLId').notEmpty().isUUID().withMessage('shortURLId must be an UUID'),
    body('customShortCode').notEmpty().isAlphanumeric().withMessage('Short code must be alphanumeric'),
  ],
  delete: [
    param('shortURLId').isUUID().withMessage('shortURLId must be an UUID'),
  ],
  showLongUrl: [
    param('shortCode').notEmpty().isAlphanumeric().withMessage('Short code must be alphanumeric'),
  ]
};

const validateShortURLRequest = (requestType) => {
  const validationRules = validationRulesMap[requestType] || [];

  return [
    ...validationRules,
    (req, res, next) => {
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      return res.status(400).json({ errors: errors.array() });
    },
  ];
};

module.exports = {
  validateShortURLRequest,
};
