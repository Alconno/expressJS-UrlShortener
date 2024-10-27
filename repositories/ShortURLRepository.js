const { Result } = require('express-validator');
const ShortURL = require('../models/ShortURL');

class ShortURLRepository {
  // Create a new short URL in the database
  async createShortURL(longURL, shortCode, userId) {
    // Create a new ShortURL instance
    const shortURL = new ShortURL({
      longURL,
      shortCode,
      userId,
    });

    // Save the new short URL to the database
    await shortURL.save();
    return shortURL;
  }

  // Find a short URL by its short code
  async showByShortCode(shortCode){
    return await ShortURL.findOne({shortCode});
  }

  // Find a short URL by its ID
  async showById(shortURLId){
    return await ShortURL.findById(shortURLId);
  }

  // List all short URLs associated with a user
  async listByUser(userId){
    return await ShortURL.find({ userId: userId });
  }

  // Update the short code of a given short URL
  async update(shortURLId, customShortCode){
    const shortURL = await ShortURL.findById(shortURLId);

    if(shortURL){
      // Update the short code
      shortURL.shortCode = customShortCode;
      await shortURL.save();
    }

    return shortURL;
  }

  // Delete a short URL based on its ID and user ID
  async delete(userId, shortURLId){
    const result = await ShortURL.deleteOne({ _id: shortURLId, userId: userId });

    return result.deletedCount;
  }
}

// Export an instance of ShortURLRepository
module.exports = new ShortURLRepository();
