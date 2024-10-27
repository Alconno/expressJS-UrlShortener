
const userLogService = require('../services/UserLogService');
require('dotenv').config();

/**
 * @swagger
 * tags:
 *   name: UserLogs
 *   description: User Log operations
 */
class UserLogController {


    /**
     * @swagger
     * path:
     *   /api/userLogs:
     *     get:
     *       summary: Get paginated user logs.
     *       tags: [UserLogs]
     *       parameters:
     *         - in: query
     *           name: search
     *           schema:
     *             type: string
     *           description: Search string for log descriptions.
     *         - in: query
     *           name: sortField
     *           schema:
     *             type: string
     *           description: Field to sort logs by (e.g., 'description', 'action', 'timestamp').
     *         - in: query
     *           name: sortOrder
     *           schema:
     *             type: string
     *           description: Sort order ('asc' or 'desc').
     *         - in: query
     *           name: page
     *           schema:
     *             type: integer
     *           description: Page number.
     *         - in: query
     *           name: pageSize
     *           schema:
     *             type: integer
     *           description: Number of items per page.
     *         - in: query
     *           name: filterByAction
     *           schema:
     *             type: string
     *           description: Filter logs by action ('post', 'create', 'update', 'delete', 'show').
     *       responses:
     *         '200':
     *           description: Successful response with paginated user logs.
     *         '400':
     *           description: Bad request with validation errors.
     *         '500':
     *           description: Internal server error.
     */
    async paginated(req, res) {
        try {
            const { search, sortField, sortOrder, page, pageSize, filterByAction } = req.query;

            // Call the service to get logs
            const result = await userLogService.paginated({ search, sortField, sortOrder, page, pageSize, filterByAction });

            // Send the response
            res.json(result);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}


module.exports = new UserLogController();
