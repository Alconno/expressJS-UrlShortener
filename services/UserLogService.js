const userLogRepository = require('../repositories/UserLogRepository');
const validActions = require('../public/actions');

/**
 * Service class for handling business logic related to UserLog entities.
 */
class UserLogService {
    /**
     * Creates a new user log entry.
     * @param {string} action - The action performed by the user.
     * @param {string} description - Description of the user action.
     * @param {string} userId - The unique identifier for the user associated with the log.
     */
    async create(action, description, userId) {
        // Delegate the creation of the user log to the repository
        await userLogRepository.create(action, description, userId);
    }

    /**
     * Retrieves paginated user logs based on specified criteria.
     * @param {Object} options - Options for paginated log retrieval.
     * @param {string} options.search - Search string for log descriptions.
     * @param {string} options.sortField - Field to sort logs by (e.g., 'description', 'action', 'timestamp').
     * @param {string} options.sortOrder - Sort order ('asc' or 'desc').
     * @param {number} options.page - Page number for pagination.
     * @param {number} options.pageSize - Number of items per page for pagination.
     * @param {string} options.filterByAction - Filter logs by action ('post', 'create', 'update', 'delete', 'show').
     * @returns {Object} - Object containing an array of paginated user logs.
     */
    async paginated({ search, sortField, sortOrder, page, pageSize, filterByAction }) {
        // Build the search criteria
        const searchCriteria = search
            ? { description: { $regex: new RegExp(search, 'i') } }
            : {};

        // Build the sort criteria
        const sortFieldToUse = sortField || 'timestamp';
        const sortOrderToUse = sortOrder === 'desc' ? -1 : 1;
        const sortCriteria = { [sortFieldToUse]: sortOrderToUse };

        // Include or exclude soft-deleted records based on filterByAction
        const actionFilter = filterByAction && validActions.includes(filterByAction)
            ? { action: filterByAction }
            : {};

        // Merge search criteria with action filter
        const finalCriteria = { ...searchCriteria, ...actionFilter };

        // Query the repository to retrieve paginated user logs
        const logs = await userLogRepository.paginated(finalCriteria, sortCriteria, (page - 1) * pageSize, pageSize);

        return { logs };
    }
}

// Export an instance of the UserLogService to be used as a singleton
module.exports = new UserLogService();
