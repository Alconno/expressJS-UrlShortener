const { query, validationResult } = require('express-validator');
const validActions = require('../public/actions');

const validationRulesMap = {
    paginated: [
        query('search').optional().isString()
            .withMessage('Invalid search parameter. It must be a string'),
    
        query('sortField').optional().custom(value => {
            const lowercasedValue = value.toLowerCase();
            const isValid = ['description', 'action', 'timestamp'].includes(lowercasedValue);
            return isValid;
        }).withMessage('Invalid sortField parameter. It must be either description, action, or timestamp'),
        
        query('sortOrder').optional().custom(value => ['ASC', 'DESC'].includes(value.toUpperCase()))
            .withMessage('Invalid sortOrder parameter. It must be ASC or DESC'),

        query('page').optional().custom(value => !isNaN(parseInt(value)))
            .withMessage('Invalid page parameter. It must be a valid number'),

        query('pageSize').optional().custom(value => !isNaN(parseInt(value)))
            .withMessage('Invalid pageSize parameter. It must be a valid number'),

        query('filterByAction').optional().custom(value => {
            if (!validActions.includes(value.toUpperCase())) {
                throw new Error(`Invalid filterByAction parameter. It must be one of these: ${validActions.join(', ')}`);
            }
            return true;
        }),
            
    ],
};

const validateUserLogRequest = (requestType) => {
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
    validateUserLogRequest,
};