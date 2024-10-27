const UserLog = require('../models/UserLog'); 

/**
 * Repository class for UserLog entity handling database operations.
 */
class UserLogRepository {
    /**
     * Creates a new user log entry in the database.
     * @param {string} action - The action performed by the user.
     * @param {string} description - Description of the user action.
     * @param {string} userId - The unique identifier for the user associated with the log.
     */
    async create(action, description, userId) {
        // Create a new UserLog instance with provided parameters
        const newUserLog = new UserLog({
            action: action,
            description: description,
            userId: userId,
        });

        // Save the new user log entry to the database
        await newUserLog.save();
    }
    
    /**
     * Retrieves paginated user logs from the database based on specified criteria.
     * @param {Object} criteria - Search criteria for filtering user logs.
     * @param {Object} sortCriteria - Sorting criteria for user logs.
     * @param {number} skip - Number of records to skip for pagination.
     * @param {number} limit - Number of records to retrieve for pagination.
     * @returns {Array} - Array of user logs matching the criteria.
     */
    async paginated(criteria, sortCriteria, skip, limit) {
        // Query the database to retrieve paginated user logs
        return UserLog.find(criteria)
            .sort(sortCriteria)
            .skip(skip)
            .limit(limit)
            .lean(); // Use lean() to get plain JavaScript objects instead of Mongoose documents
    }
}

// Export an instance of the UserLogRepository to be used as a singleton
module.exports = new UserLogRepository();
