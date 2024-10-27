const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const authRoutes = require('../routes/auth.js');
const usersRoutes = require('../routes/users.js');
const urlRoutes = require('../routes/url.js');
const userLogRoutes = require('../routes/userLogs.js')

const app = express();

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Add the cookie-parser middleware
const cookieParser = require('cookie-parser');
app.use(cookieParser());


// ------------------------- Routes -------------------------
app.use('/api/auth', authRoutes);

app.use('/api/users', usersRoutes);

app.use('/api/url', urlRoutes);

app.use('/api/userLogs', userLogRoutes);

app.get('/health', (req,res) => {
    res.send('I am healthy!');
});


// Event handler for when the MongoDB connection is open
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
     /* app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); */
});

module.exports = app;

