const bcrypt = require('bcrypt');
const authRepository = require('../repositories/AuthRepository');
const nodemailer = require('nodemailer');

require('dotenv').config();
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || '09f26e402586e2faa8da4c98a35f1b20d6b033c6097befa8be3486a829587fe2f90a832bd3ff9d42710a4da095a2ce285b009f0c3730cd9b8e1af3eb84df6611';

class AuthService {
    // Hash password using bcrypt
    async hashPassword(password) {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }

    // User registration
    async register(userData) {
        // Hash the password
        const hashedPassword = await this.hashPassword(userData.password);

        // Create a user in the repository
        const user = await authRepository.create({
            username: userData.username,
            email: userData.email.toLowerCase(),
            password: hashedPassword,
        });

        if (!user) return { user: null, verificationToken: null, verificationURL: null };

        // Create a verification token and get verification URL
        const verificationToken = await authRepository.createVerifyToken(user._id);
        let verificationURL = null;

        if (user) {
            // Send verification email
            verificationURL = await this.sendVerificationEmail(userData.email, verificationToken);
        }

        return { user, verificationToken, verificationURL };
    }

    // Resend verification token
    async reSendVerifyToken(userData) {
        const user = await authRepository.showByEmail(userData.email.toLowerCase());

        if (user && user.email_verified_at == null && await bcrypt.compare(userData.password, user.password)) {
            const verificationToken = await authRepository.createVerifyToken(user._id);
            let verificationURL = null;

            if (user) {
                // Send verification email
                verificationURL = await this.sendVerificationEmail(userData.email, verificationToken);
            }

            return { user, verificationToken, verificationURL };
        }

        return { user, verificationToken: null };
    }

    // Send verification email using nodemailer
    async sendVerificationEmail(email, verificationToken) {
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.EMAIL_ETHERAL_USER,
                pass: process.env.EMAIL_ETHERAL_PASS,
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_ETHERAL_USER,
            to: email,
            subject: 'Email Verification',
            text: `link: ${process.env.HOST}/auth/verify-email/${verificationToken._id}`,
            html: `<a href="${process.env.HOST}/auth/verify-email/${verificationToken._id}">Click to complete email verification</a>`
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            const previewURL = nodemailer.getTestMessageUrl(info);
            // Handle success if needed
        } catch (error) {
            throw new Error('Error sending verification email');
        }

        return `${process.env.HOST}/auth/verify-email/${verificationToken._id}`;
    }

    // User login
    async login(userData) {
        const user = await authRepository.showByEmail(userData.email.toLowerCase());

        if (user && user.email_verified_at !== null && await bcrypt.compare(userData.password, user.password)) {
            // Passwords match, generate JWT token
            const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });
            return { user, token, passwordMatch: true };
        } else {
            // Incorrect username or password
            return { user, token: null, passwordMatch: false };
        }
    }

    // Get user data by token ID
    async getDataByTokenId(token_id) {
        return await authRepository.getDataByTokenId(token_id);
    }
}

module.exports = new AuthService();
