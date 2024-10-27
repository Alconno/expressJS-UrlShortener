const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/AuthMiddleware.js');
const { validateUserLogRequest } = require('../Validations/UserLogValidation.js');
const UserLogController = require('../controllers/UserLogController.js');

router.get('/', verifyToken, validateUserLogRequest("paginated"), UserLogController.paginated);

module.exports = router;
