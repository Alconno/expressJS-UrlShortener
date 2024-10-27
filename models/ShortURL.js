const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { Schema } = mongoose;

/**
 * @typedef ShortURL
 * @property {string} _id - The unique identifier for the short URL (automatically generated using mongoose)
 * @property {string} longURL.required - The original long URL
 * @property {string} shortCode.required - The custom or auto-generated short code for the URL
 * @property {string} userId.required - The user ID associated with the short URL
 */
const shortURLSchema = new Schema({
  _id: { type: String, default: uuidv4 },
  longURL: { type: String, required: true },
  shortCode: { type: String, required: true },
  userId: { type: String, required: true },
});

// Create a unique compound index combining shortCode and userId
shortURLSchema.index({ shortCode: 1, userId: 1 }, { unique: true });

/**
 * Mongoose model for ShortURL.
 * @typedef {Object} ShortURL
 * @property {string} _id - The unique identifier for the short URL (automatically generated using mongoose)
 * @property {string} longURL - The original long URL
 * @property {string} shortCode - The custom or auto-generated short code for the URL
 * @property {string} userId - The user ID associated with the short URL
 */
const ShortURL = mongoose.model('ShortURL', shortURLSchema);

module.exports = ShortURL;
