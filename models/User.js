const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { Schema } = mongoose;

/**
 * @typedef User
 * @property {string} _id - The unique identifier for the user (automatically generated using uuidv4)
 * @property {string} username.required - The username of the user (must be unique)
 * @property {string} email.required - The email address of the user (must be unique)
 * @property {string} password.required - The hashed password of the user
 */

const userSchema = new Schema({
  _id: { type: String, default: uuidv4 }, 
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email_verified_at: { type: Date, default: null },
});

userSchema.virtual('shortURLs', {
  ref: 'ShortURL',
  localField: '_id',
  foreignField: 'userId',
  justOne: false,
  cascade: true, // Enable cascade delete
});

userSchema.post('deleteMany', async function (docs) {
  const userIds = docs.map(doc => doc._id);
  await mongoose.models.ShortURL.deleteMany({ userId: { $in: userIds } });
});

// Add custom error message for unique constraint
userSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    // Duplicate key error (unique constraint violation)
    const key = Object.keys(error.keyPattern)[0];
    const value = error.keyValue[key];

    if (key === 'username') {
      error.message = `Username '${value}' is already in use.`;
    } else if (key === 'email') {
      error.message = `Email '${value}' is already in use.`;
  }
}

  next(error);
});

/**
 * Mongoose model for User.
 * @typedef {Object} User
 * @property {string} _id - The unique identifier for the user (automatically generated using uuidv4)
 * @property {string} username - The username of the user
 * @property {string} email - The email address of the user
 * @property {string} password - The hashed password of the user
 */

const User = mongoose.model('User', userSchema);

module.exports = User;
