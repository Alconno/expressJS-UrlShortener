const { body, param, query, validationResult } = require('express-validator');

const validationRulesMap = {
    show: [
        param('user_id').isUUID().notEmpty().withMessage('User ID is required'),
    ],
    update: [
        body('email').optional().isEmail().withMessage('Invalid email address'),
        body('username').optional().notEmpty().withMessage('Username cannot be empty'),
    ],
};

const validateUserRequest = (requestType) => {
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
    validateUserRequest,
};