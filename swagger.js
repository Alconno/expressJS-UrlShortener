const swaggerJSDoc = require('swagger-jsdoc');
const glob = require('glob');
const path = require('path');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Url shortener API',
            version: '1.0.0',
        },
        components: {
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        username: { type: 'string', default: 'defaultUsername' },
                        email: { type: 'string', default: 'defaultEmail@example.com' },
                        password: { type: 'string', default: 'defaultPassword' },
                    },
                    required: ['username', 'email', 'password'],
                },
                ShortURL: {
                  type: 'object',
                  properties: {
                      longURL: { type: 'string', default: 'https://www.youtube.com/' },
                      shortCode: { type: 'string', default: 'yt' },
                      userId: { type: 'string', default: '2f579848-4c63-4c44-9b9a-7db8578a1e1e' },
                  },
                  required: ['username', 'email', 'password'],
                },
                UserLog: {
                    type: 'object',
                    properties: {
                        action: { type: 'string', default: 'CREATE' },
                        description: { type: 'string', default: 'User created shortURL'},
                        userId: { type: 'string', default: '2f579848-4c63-4c44-9b9a-7db8578a1e1e' },
                    },
                    required: ['username', 'email', 'password'],
                },
            },
        },
    },
    apis: glob.sync(path.join(__dirname, 'controllers', '*.js')), // Assuming your controllers are in the 'controllers' directory
};
  

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
