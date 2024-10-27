const express = require('express');
const bodyParser = require('body-parser');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger.js');

const authRoutes = require('./routes/auth.js');
const usersRoutes = require('./routes/users.js');
const urlRoutes = require('./routes/url.js');
const userLogRoutes = require('./routes/userLogs.js')

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
const connectDB = require('./config/db');
connectDB();

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Add the cookie-parser middleware
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// ------------------------- Routes -------------------------
app.use('/api/auth', authRoutes);

app.use('/api/users', usersRoutes);

app.use('/api/url', urlRoutes);

app.use('/api/userLogs', userLogRoutes);

app.get('/health', (req,res) => {
    res.send('I am healthy!');
});


// Start server
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});
