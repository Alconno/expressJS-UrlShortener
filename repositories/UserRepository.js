const User = require('../models/User'); // Import the User model

class UserRepository {
    // Create a new user in the database
    async create({ email, username, password }) {
        // Create a new User instance
        const newUser = new User({
            username: username,
            email: email,
            password: password,
        });

        // Save the new user to the database
        const savedUser = await newUser.save();
        return savedUser;
    }

    // Find a user by its ID
    async showById(user_id) {
        return await User.findById(user_id);
    }

    // Find a user by its email
    async showByEmail(email) {
        if(email)
            return await User.findOne({ email });

        return null;
    }

    // Update user information based on user ID
    async update(user_id, { email, username }) {
        // Find the user by ID
        const user = await User.findById(user_id);

        if(user){
            // Check if the email is provided and not already taken
            if (email !== undefined){
                if(await this.showByEmail(email) != null) 
                    return 5; // Return a custom code (e.g., 5) to indicate email conflict
                user.email = email;
            }

            // Check if the username is provided and not already taken
            if (username !== undefined){
                if(await User.findOne({username}) != null) 
                    return 5; // Return a custom code (e.g., 5) to indicate username conflict
                user.username = username;
            }

            // Save the updated user information
            await user.save();
        }

        return user;
    }
};

// Export an instance of UserRepository
module.exports = new UserRepository();
