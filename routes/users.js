const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/AuthMiddleware.js');
const userController = require('../controllers/UserController');
const { validateUserRequest } = require('../Validations/UserValidation');

router.get('/:user_id', validateUserRequest('show'), userController.show);
router.patch('/', verifyToken, validateUserRequest('update'), userController.update);

module.exports = router;
