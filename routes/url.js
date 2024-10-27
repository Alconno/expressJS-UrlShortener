const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/AuthMiddleware.js');
const { validateShortURLRequest } = require('../Validations/ShortURLValidation.js');
const ShortURLController = require('../controllers/ShortURLController.js');

router.post('/shorten', verifyToken, validateShortURLRequest("shortenURL"), ShortURLController.shortenURL);
router.get('/:shortCode', verifyToken, validateShortURLRequest("redirect"), ShortURLController.redirectToLongURL);
router.get('/:shortCode/show-long-url', validateShortURLRequest("showLongUrl"), ShortURLController.showLongUrl);
router.get('/list/logged-user', verifyToken, ShortURLController.listLoggedUserUrls);
router.patch('/update/:shortURLId', verifyToken, validateShortURLRequest("update"), ShortURLController.update);
router.delete('/delete/:shortURLId', verifyToken, validateShortURLRequest("delete"), ShortURLController.delete);

module.exports = router;
