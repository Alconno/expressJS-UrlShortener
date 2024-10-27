const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET || '19f26e402586e2faa8da4c98a35f1b20d6b033c6097befa8be3486a829587fe2f90a832bd3ff9d42710a4da095a2ce285b009f0c3730cd9b8e1af3eb84df6611';

function verifyToken(req, res, next) {
  // Try to get the token from the Authorization header
  let token = req.headers.authorization;

  // If not found in the header, try to get the token from the cookies
  if (!token && req.cookies.jwtAuthToken) {
    token = req.cookies.jwtAuthToken;
  }

  // Check if token is provided
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, jwtSecret);

    // Attach the decoded user information to the request object
    req.userId = decoded.userId;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Handle token verification errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized - Token has expired' });
    }

    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
}

module.exports = verifyToken;
