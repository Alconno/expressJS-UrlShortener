
const authService = require('../services/AuthService');
const userLogService = require('../services/UserLogService');
const User = require('../models/User');

require('dotenv').config();
const jwt = require('jsonwebtoken');
/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication operations
 */

class AuthController {
    
    /**
     * @swagger
     * /api/auth/register:
     *   post:
     *     summary: Register a new user
     *     tags:
     *       - Authentication
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/User'
     *     responses:
     *       201:
     *         description: Successful registration
     *         content:
     *           application/json:
     *             example:
     *               username: john_doe
     *               email: john.doe@example.com
     *       400:
     *         description: Bad Request Data or User already exists
     *         content:
     *           application/json:
     *             example:
     *               error: Bad Request Data or User already exists
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             example:
     *               error: Internal Server Error
     */
    async register(req, res) {
        try {
            const {user, verificationToken, verificationURL} = await authService.register(req.body);

            if(!user)
                return res.status(409).json({error: 'User already exists'});

            // Add User Log
            await userLogService.create("RECEIVE_TOKEN", `User "${user.username} - ${user.email}" registration email confirmation in progress - Received Email Verification Token "${verificationToken}"`, user._id);


            res.status(201).json({user, verificationToken, verificationURL});
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }


    /**
    * @swagger
    * /api/auth/resend-verify-token:
    *   get:
    *     summary: Re-send email verification token
    *     tags: [Authentication]
    *     parameters:
    *       - in: body
    *         name: email
    *         required: true
    *         description: User's email address
    *         schema:
    *           type: string
    *       - in: body
    *         name: password
    *         required: true
    *         description: User's password
    *         schema:
    *           type: string
    *           minLength: 6
    *     responses:
    *       200:
    *         description: Verification token re-sent successfully
    *         content:
    *           application/json:
    *             example:
    *               verificationToken: "newToken"
    *               verificationURL: "http://example.com/verify-email/newToken"
    *       400:
    *         description: User doesn't exist or Bad Request - Token creation failed
    *         content:
    *           application/json:
    *             example:
    *               error: User doesn't exist or Bad Request - Token creation failed
    *       404:
    *         description: User doesn't exist
    *         content:
    *           application/json:
    *             example:
    *               error: User doesn't exist
    *       500:
    *         description: Internal Server Error
    *         content:
    *           application/json:
    *             example:
    *               error: Internal Server Error
    */
    async resendVerifyToken(req, res) {
        try {
            // Attempt to resend the verification token
            const { user, verificationToken, verificationURL } = await authService.reSendVerifyToken(req.body);
    
            // Check if the user doesn't exist
            if (!user)
                return res.status(404).json({ error: "User doesn't exist" });
    
            // Check if the user's email is already verified
            if (user.email_verified_at !== null)
                return res.status(200).json({ message: 'Email already verified' });
    
            // Check if the verification token creation failed
            if (!verificationToken)
                return res.status(400).json({ error: "Bad Request - Token creation failed" });
    
            // Add User Log for token resend
            await userLogService.create("RECEIVE_TOKEN", `User "${user.username} - ${user.email}" requested resend of email token - Received Email Verification Token "${verificationToken}"`, user._id);
    
            // Send the verification token and URL in the response
            res.status(200).json({ verificationToken, verificationURL });
        } catch (error) {
            // Handle internal server error
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    


    /**
     * @swagger
     * /api/auth/verify-email/{token}:
     *   get:
     *     summary: Verify email based on the provided token
     *     tags: [Authentication]
     *     parameters:
     *       - in: path
     *         name: token
     *         required: true
     *         description: The verification token
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Email verified successfully
     *         content:
     *           application/json:
     *             example:
     *               message: Email verified successfully
     *       403:
     *         description: Unauthorized or Email already verified
     *         content:
     *           application/json:
     *             example:
     *               error: Unauthorized or Email already verified
     *       404:
     *         description: Invalid verification token or User doesn't exist
     *         content:
     *           application/json:
     *             example:
     *               error: Invalid verification token or User doesn't exist
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             example:
     *               error: Internal Server Error
     */
    async verifyEmail(req, res) {
        try {
            // Extract token from request parameters
            const token_id = req.params.token;
    
            // Retrieve token and user information using the token ID
            const { token, user } = await authService.getDataByTokenId(token_id);
    
            // Check if the token is invalid or expired
            if (!token)
                return res.status(403).json({ error: 'Invalid token or expired' });
    
            // Check if the token action name is for email verification
            if (token.action_name && token.action_name != "registration_verification")
                return res.status(403).json({ error: 'Invalid token action name' });
    
            // Check if the user exists
            if (!user)
                return res.status(404).json({ error: "User doesn't exist" });
    
            // Check if the user's email is already verified
            if (user.email_verified_at !== null)
                return res.status(200).json({ message: 'Email already verified' });
    
            // Check if the token has expired
            if (token.expires_at && new Date() > token.expires_at)
                return res.status(403).json({ error: 'Token has expired' });
    
            // Mark the user's email as verified and save the user
            user.email_verified_at = Date.now();
            await user.save();
    
            // Mark the token as executed and save the token
            token.executed_at = Date.now();
            await token.save();
    
            // Add User Log for email verification
            await userLogService.create("VERIFY_EMAIL", `User "${user.username} - ${user.email}" verified their email at ${user.email_verified_at}`, user._id);
    
            // Send a success response
            res.status(200).json({ message: 'Email verified successfully' });
        } catch (error) {
            // Handle internal server error
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    


    /**
     * @swagger
     * /api/auth/login:
     *   post:
     *     summary: Log in an existing user
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/User'
     *     responses:
     *       200:
     *         description: Successful login
     *         content:
     *           application/json:
     *             example:
     *               user:
     *                 username: john_doe
     *                 email: john.doe@example.com
     *               JwtToken: "jwtAuthToken"
     *       400:
     *         description: User not found, User not verified, or Password does not match
     *         content:
     *           application/json:
     *             example:
     *               error: User not found, User not verified, or Password does not match
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             example:
     *               error: Internal Server Error
     */
    async login(req, res) {
        try {
            // Check if user is already logged in with a valid token
            if (req && req.cookies && req.cookies.jwtAuthToken) {
                const decoded = jwt.decode(req.cookies.jwtAuthToken);
    
                // Check if the token is not expired
                if (decoded && decoded.exp * 1000 > Date.now()) {
                    return res.status(409).json({ message: 'User already logged in' });
                }
            }
    
            // Attempt to login with the provided credentials
            const { user, token, passwordMatch } = await authService.login(req.body);
    
            // Check if the user is not found
            if (!user)
                return res.status(404).json({ error: 'User not found' });
    
            // Check if the user's email is not verified
            if (user.email_verified_at == null)
                return res.status(403).json({ error: 'User not verified' });
    
            // Check if the provided password does not match
            if (!passwordMatch)
                return res.status(400).json({ error: 'Password does not match' });
    
            // Add User Log for login
            await userLogService.create("LOGIN", `User "${user.username} - ${user.email}" logged in`, user._id);
    
            // Set the JWT token in the cookie and send a success response
            res.cookie('jwtAuthToken', token, { httpOnly: true, secure: false });
            res.status(200).json({ user, JwtToken: token });
        } catch (error) {
            // Handle internal server error
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    

    /**
     * @swagger
     * /api/auth/logout:
     *   post:
     *     summary: Logout the authenticated user
     *     tags: [Authentication]
     *     security:
     *       - jwtAuth: []
     *     responses:
     *       200:
     *         description: Logout successful
     *         content:
     *           application/json:
     *             example:
     *               message: Logout successful
     *       401:
     *         description: Unauthorized - User not logged in
     *         content:
     *           application/json:
     *             example:
     *               error: User not logged in
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             example:
     *               error: Internal Server Error
     */
    async logout(req, res) {
        try {
            const userId = req.userId;
            const user = await User.findById(userId);
            
            // Clear the 'jwtAuthToken' cookie
            res.clearCookie('jwtAuthToken');
    
            // Add User Log
            await userLogService.create("LOGOUT", `User "${user.username} - ${user.email}" logged out`, userId);

            // Send a response indicating successful logout
            res.status(200).json({ message: 'Logout successful' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    
};

module.exports = new AuthController();
