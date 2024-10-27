const userService = require('../services/UserService');
const userLogService = require('../services/UserLogService');



class UserController {

    /**
     * @swagger
     * /api/users/{user_id}:
     *   get:
     *     summary: Get user details by ID
     *     tags: [Users]
     *     parameters:
     *       - in: path
     *         name: user_id
     *         required: true
     *         schema:
     *           type: string
     *         description: User ID
     *     responses:
     *       200:
     *         description: Successful retrieval of user details
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     *       404:
     *         description: User not found
     *         content:
     *           application/json:
     *             example:
     *               error: User not found
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             example:
     *               error: Internal Server Error
     */
    async show(req, res) {
        try {
            const user = await userService.show(req.params.user_id);

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.status(200).json(user);

        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    /**
     * @swagger
     * /api/users:
     *   patch:
     *     summary: Update user details
     *     tags: [Users]
     *     security:
     *       - jwtAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               username:
     *                 type: string
     *               email:
     *                 type: string
     *             required:
     *               - username
     *               - email
     *     responses:
     *       200:
     *         description: Successful update of user details
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     *       400:
     *         description: Invalid update data
     *         content:
     *           application/json:
     *             example:
     *               error: Invalid update data
     *       401:
     *         description: User not logged in
     *         content:
     *           application/json:
     *             example:
     *               error: User not logged in
     *       404:
     *         description: User not found
     *         content:
     *           application/json:
     *             example:
     *               error: User not found
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             example:
     *               error: Internal Server Error
     */
    async update(req, res) {
        try {
            const userId = req.userId;

            const oldUser = await userService.show(userId);
            const user = await userService.update(userId, req.body);

            if (!user) 
                return res.status(404).json({ error: 'User not found' });

            if(user==5)
                return res.status(400).json({ error: "Invalid update data"});

            // Add User Log
            await userLogService.create("UPDATE", "User updated their data: "+
                `${req.body.username ? `\n${oldUser.username} to ${user.username}` : ""}`+
                `${req.body.email ? `\n${oldUser.email} to ${user.email}` : ""}`, userId);


            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

};

module.exports = new UserController();