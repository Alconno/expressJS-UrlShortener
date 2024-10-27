const ShortURLRepository = require('../repositories/ShortURLRepository');
const userRepository = require('../repositories/UserRepository');
const shortid = require('shortid');

class ShortURLService {
  // Create a short URL
  async shortenURL(longURL, customShortCode, userId) {
    // Check if the user is logged in
    const user = await userRepository.showById(userId);
    if (!user) {
      throw new Error('You must login first to create shortURLs');
    }

    // Check if the custom short code is available
    const existingShortURL = await ShortURLRepository.showByShortCode(customShortCode);
    if (existingShortURL) {
      throw new Error('Custom short code is already in use');
    }

    // Create a new short URL
    const shortCode = customShortCode || this.generateShortCode();
    const shortURL = await ShortURLRepository.createShortURL(longURL, shortCode, userId);

    return shortURL;
  }

  // Redirect to the long URL
  async redirectToLongURL(shortCode) {
    const shortURL = await ShortURLRepository.showByShortCode(shortCode);

    if (!shortURL) {
      throw new Error('Short URL not found');
    }

    return shortURL.longURL;
  }

  // List short URLs for a logged-in user
  async listLoggedUserUrls(userId) {
    const userUrls = await ShortURLRepository.listByUser(userId);

    return userUrls;
  }

  // Update short URL with a custom short code
  async update(userId, shortURLId, customShortCode) {
    // Check if the custom short code is available
    const existingShortURL = await ShortURLRepository.showByShortCode(customShortCode);
    if (existingShortURL) {
      throw new Error('Custom short code is already in use');
    }

    // Check if it matches the current userId
    if (existingShortURL && existingShortURL.userId !== userId) {
      throw new Error('ShortURL does not belong to this user');
    }

    const updatedShortUrl = await ShortURLRepository.update(shortURLId, customShortCode);

    return updatedShortUrl;
  }

  // Delete a short URL
  async delete(userId, shortURLId) {
    const success = await ShortURLRepository.delete(userId, shortURLId);
    return success;
  }

  // Show long URL by short code
  async showLongUrl(shortCode) {
    return await ShortURLRepository.showByShortCode(shortCode);
  }

  // Show short URL by ID
  async showById(shortURLId) {
    return await ShortURLRepository.showById(shortURLId);
  }

  // Generate a random short code
  generateShortCode() {
    const shortCode = shortid.generate();
    return shortCode;
  }
}

module.exports = new ShortURLService();
