const { body, param, validationResult } = require('express-validator');


const validationRulesMap = {
    register: [
        body('email').isEmail().withMessage('Invalid email address'),
        body('username').notEmpty().withMessage('Username cannot be empty'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    ],
    login: [
        body('email').isEmail().withMessage('Invalid email address'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    ],
    verifyEmail: [
        param('token').isUUID().notEmpty().withMessage('verify token is required'),
    ],
    resendToken: [
        body('email').isEmail().withMessage('Invalid email address'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    
    ]
};

const validateAuthRequest = (requestType) => {
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
    validateAuthRequest,
};