const validActions = require('../public/actions');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

/**
 * @swagger
 * components:
 *   schemas:
 *     UserLog:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier for the user log (automatically generated using uuidv4).
 *         userId:
 *           type: string
 *           description: The unique identifier for the user associated with the log.
 *         description:
 *           type: string
 *           description: Provide info about user action.
 *         action:
 *           type: string
 *           description: The action performed by the user (e.g., login, logout, update).
 *           enum: ['UPDATE', 'DELETE', 'CREATE', 'SHOW', 'POST']  // Enum for valid actions
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the action occurred.
 */

// Define the UserLog schema
const userLogSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 }, 
    userId: {
      type: String,
      ref: 'User', // Assuming you have a User model, adjust if needed
      required: true,
    },
    description: {
        type: String,
        required: true,
    },
    action: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return validActions.includes(value);
        },
        message: props => `${props.value} is not a valid action. Use UPDATE, DELETE, CREATE, SHOW or POST.`,
      },
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'userlogs' } // Adjust collection name if needed
);

// Create the UserLog model
const UserLog = mongoose.model('UserLog', userLogSchema);

// Export the UserLog model
module.exports = UserLog;