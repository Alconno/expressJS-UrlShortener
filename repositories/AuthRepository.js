const User = require('../models/User'); // Import the User model
const ActionToken = require('../models/ActionToken');

class AuthRepository {
    // Create a new user in the database
    async create({ username, email, password }) {
        // Check if the email or username is already in use
        if (await this.showByEmail(email) !== null || await this.showByUsername(username) !== null) {
            return null;
        }

        // Create a new User instance
        const newUser = new User({
            username,
            email,
            password,
        });

        // Save the new user to the database
        const savedUser = await newUser.save();
        return savedUser;
    }

    // Find a user by their email
    async showByEmail(email) {
        if (email)
            return await User.findOne({ email });

        return null;
    }

    // Find a user by their username
    async showByUsername(username) {
        if (username)
            return await User.findOne({ username });

        return null;
    }

    // Create a verification token for a given entity (e.g., user registration)
    async createVerifyToken(entity_id) {
        const newVerifyToken = new ActionToken({
            entity_id: entity_id,
            action_name: "registration_verification",
            expires_at: new Date(Date.now() + 15 * 60 * 1000), // Set expiration to 15 minutes from now
            executed_at: null,
        });

        // Save the new verification token to the database
        await newVerifyToken.save();
        return newVerifyToken;
    }

    // Get data associated with a given token ID, including the associated user
    async getDataByTokenId(token_id) {
        const token = await ActionToken.findById(token_id);
        if (!token) return { token: null, user: null };
        const user = await User.findById(token.entity_id);
        return { token, user };
    }
}

// Export an instance of AuthRepository
module.exports = new AuthRepository();
