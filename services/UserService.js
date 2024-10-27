const bcrypt = require('bcrypt');
const userRepository = require('../repositories/UserRepository');

class UserService {
    // Hash the user password using bcrypt
    async hashPassword(password) {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }

    // Get user details by user ID
    async show(userId) {
        return await userRepository.showById(userId);
    }

    // Update user details by user ID
    async update(userId, { email, username }) {
        return await userRepository.update(userId, { email, username });
    }
}

module.exports = new UserService();
