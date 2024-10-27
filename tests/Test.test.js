// Import necessary libraries and modules
const request = require('supertest'); // Library for making HTTP requests
const { MongoMemoryServer } = require('mongodb-memory-server'); // In-memory MongoDB server for testing
const mongoose = require('mongoose'); // MongoDB object modeling tool
const User = require('../models/User'); // User model
const ActionToken = require('../models/ActionToken'); // ActionToken model
const ShortURL = require('../models/ShortURL'); // ShortURL model
const app = require('../testEnviroment/test-index'); // Express application for testing

// Create an instance of the in-memory Mongo server
const mongoServer = new MongoMemoryServer();

// Set up before all tests
beforeAll(async () => {
    // Start the in-memory Mongo server
    await mongoServer.start();

    // Wait for some time before connecting (you may adjust the duration)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Get the connection string of the in-memory database
    const mongoUri = mongoServer.getUri();

    // Check if mongoose is already connected
    if (mongoose.connection.readyState === 0) {
        // Connect to the in-memory database
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }
});

// Clean up after all tests
afterAll(async () => {
    // Disconnect Mongoose and stop the in-memory database
    await mongoose.disconnect();
    await mongoServer.stop();
});



// Variables to store user and URL IDs
let localUserId = null;
let localShortUrlId = null;
let localVerifyTokenId = null;
let cookies = null;




// Test suite for creating and showing users
describe('Creating and showing User', () => {
    // Test case: Create(SUCCESS) and Show(SUCCESS) a new user
    test('Create(SUCCESS) and Show(SUCCESS) a new user', async () => {
        // Create a mock user object
        const mockUser = {
            username: 'Jasminko',
            email: 'jasminko@gmail.com',
            password: 'jasminko123',
        };

        // Make a POST request to create a new user
        const response = await request(app)
            .post('/api/auth/register')
            .send(mockUser);

        // Assertion: Check if the response status is 201 (Created)
        expect(response.status).toBe(201);

        // Make a GET request to get the newly created user
        const createdUser = (await request(app)
            .get(`/api/users/${response._body.user._id}`)
            .send())._body;

        // Assertions: Validate user fields
        expect(createdUser).toBeDefined();
        expect(createdUser.username).toBe(mockUser.username);
        expect(createdUser.email).toBe(mockUser.email);
        expect(createdUser.password).toBeDefined();
        expect(createdUser.email_verified_at).toBe(null);

        // Validate email verify token being generated
        const emailVerificationToken = response._body.verificationToken;
        expect(emailVerificationToken).toBeDefined();
        expect(emailVerificationToken.action_name).toBe("registration_verification");
        expect(emailVerificationToken.entity_id).toBe(createdUser._id);

        // Validate verification URL being returned
        expect(response._body.verificationURL).toBeDefined();

        // Save user's ID for further testing
        localUserId = createdUser._id;
        localVerifyTokenId = emailVerificationToken._id;
    });

    // Test case: Create(FAIL) user: username empty
    test('Create(FAIL) user: username empty', async () => {
        // Create a mock user object
        const mockUser = {
            username: '',
            email: 'Jazatirko@gmail.com',
            password: 'jasminko123',
        };

        // Make a POST request to create a new user
        const response = await request(app)
            .post('/api/auth/register')
            .send(mockUser);

        // Assertion: Check if the response status is 400 (Bad Request)
        expect(response.status).toBe(400);
    });

    // Test case: Create(FAIL) user: Invalid email
    test('Create(FAIL) user: Invalid email', async () => {
        // Create a mock user object
        const mockUser = {
            username: 'Jasasinko',
            email: 'com',
            password: 'jasminko123',
        };

        // Make a POST request to create a new user
        const response = await request(app)
            .post('/api/auth/register')
            .send(mockUser);

        // Assertion: Check if the response status is 400 (Bad Request)
        expect(response.status).toBe(400);
    });

    // Test case: Create(FAIL) user: Invalid password
    test('Create(FAIL) user: Invalid password', async () => {
        // Create a mock user object
        const mockUser = {
            username: 'Jamtsasinko',
            email: 'Johatizko@gmail.com',
            password: '123',
        };

        // Make a POST request to create a new user
        const response = await request(app)
            .post('/api/auth/register')
            .send(mockUser);

        // Assertion: Check if the response status is 400 (Bad Request)
        expect(response.status).toBe(400);
    });

    // Test case: Create(FAIL) user: Username already exists
    test('Create(FAIL) user: Username already exists', async () => {
        // Create a mock user object
        const mockUser = {
            username: 'Jasminko',
            email: 'aiermowr@gmail.com',
            password: 'jasminko123',
        };

        // Make a POST request to create a new user
        const response = await request(app)
            .post('/api/auth/register')
            .send(mockUser);

        // Assertion: Check if the response status is 409 (Conflict)
        expect(response.status).toBe(409);
    });

    // Test case: Create(FAIL) user: Email already exists
    test('Create(FAIL) user: Email already exists', async () => {
        // Create a mock user object
        const mockUser = {
            username: 'aiofneifmewa',
            email: 'jasminko@gmail.com',
            password: 'jasminko123',
        };

        // Make a POST request to create a new user
        const response = await request(app)
            .post('/api/auth/register')
            .send(mockUser);

        // Assertion: Check if the response status is 409 (Conflict)
        expect(response.status).toBe(409);
    });

    // Test case: Show(FAIL) user: Invalid UUID
    test('Show(FAIL) user: Invalid UUID', async () => {
        const invalidUuid = 'notanuuid';
        const response = await request(app)
            .get(`/api/users/${invalidUuid}`)
            .send();

        // Assertion: Check if the response status is 400 (Bad Request)
        expect(response.status).toBe(400);
    });

    // Test case: Show(FAIL) user: Not found
    test('Show(FAIL) user: Not found', async () => {
        const invalidUuid = '06e147c1-a184-4ac7-a2ee-8bbf58bb65eb';
        const response = await request(app)
            .get(`/api/users/${invalidUuid}`)
            .send();

        // Assertion: Check if the response status is 404 (Not Found)
        expect(response.status).toBe(404);
    });
});










// Test suite for resending email verification token to the user
describe('Resending verify token to user', () => {
    // Test case: Resend user email verification GET(SUCCESS) Request
    test('(SUCCESS): Resend user email verification', async () => {
        // User information for the request
        const userInfo = {
            email: 'jasminko@gmail.com',
            password: 'jasminko123',
        };

        // Make a GET request to resend email verification
        const response = await request(app)
            .get('/api/auth/resend-verify-token')
            .send(userInfo);

        // Assertions: Check if the response status is 200 (OK)
        expect(response.status).toBe(200);
        expect(response._body.verificationToken).toBeDefined();
        expect(response._body.verificationURL).toBeDefined();
    });

    // Test case: Resend user email verification GET(FAIL) Request - User not found
    test('(FAIL): User not found', async () => {
        // User information for the request
        const userInfo = {
            email: 'jasminkoakakkakak@gmail.com',
            password: 'jasminko123',
        };

        // Make a GET request to resend email verification
        const response = await request(app)
            .get('/api/auth/resend-verify-token')
            .send(userInfo);

        // Assertion: Check if the response status is 404 (Not Found)
        expect(response.status).toBe(404);
    });

    // Test case: Resend user email verification GET(FAIL) Request - Email not provided
    test('(FAIL): Email not provided', async () => {
        // User information for the request (without email)
        const userInfo = {
            password: 'jasminko123',
        };

        // Make a GET request to resend email verification
        const response = await request(app)
            .get('/api/auth/resend-verify-token')
            .send(userInfo);

        // Assertion: Check if the response status is 400 (Bad Request)
        expect(response.status).toBe(400);
    });

    // Test case: Resend user email verification GET(FAIL) Request - Password not provided
    test('(FAIL): Password not provided', async () => {
        // User information for the request (without password)
        const userInfo = {
            email: 'jasminkoakakkakak@gmail.com',
        };

        // Make a GET request to resend email verification
        const response = await request(app)
            .get('/api/auth/resend-verify-token')
            .send(userInfo);

        // Assertion: Check if the response status is 400 (Bad Request)
        expect(response.status).toBe(400);
    });

    // Test case: Resend user email verification GET(FAIL) Request - Invalid email
    test('(FAIL): Invalid email', async () => {
        // User information for the request with an invalid email
        const userInfo = {
            email: 'ail.com',
            password: 'jasminko123',
        };

        // Make a GET request to resend email verification
        const response = await request(app)
            .get('/api/auth/resend-verify-token')
            .send(userInfo);

        // Assertion: Check if the response status is 400 (Bad Request)
        expect(response.status).toBe(400);
    });

    // Test case: Resend user email verification GET(FAIL) Request - Invalid password template
    test('(FAIL): Invalid password template', async () => {
        // User information for the request with an invalid password template
        const userInfo = {
            email: 'jasminko@gail.com',
            password: 'fl',
        };

        // Make a GET request to resend email verification
        const response = await request(app)
            .get('/api/auth/resend-verify-token')
            .send(userInfo);

        // Assertion: Check if the response status is 400 (Bad Request)
        expect(response.status).toBe(400);
    });
});








// Test suite for verifying user email
describe('Verifying user email', () => {
    // Test case: Verifying user email GET request (FAIL): Provided token has expired
    test('(FAIL): Provided token has expired', async () => {
        // Fetch the local verification token by ID
        const localVerifyToken = await ActionToken.findById(localVerifyTokenId);
        
        // Modify token expiration to simulate an expired token
        const originalExpire = localVerifyToken.expires_at;
        localVerifyToken.expires_at = localVerifyToken.created_at;
        await localVerifyToken.save();

        // Make a GET request to verify email
        const response = await request(app)
            .get(`/api/auth/verify-email/${localVerifyTokenId}`)
            .send();

        // Assertions: Check if the response status is 403 (Forbidden)
        // and if the error message is "Token has expired"
        expect(response.status).toBe(403);
        expect(response._body.error).toBe("Token has expired");

        // Restore the original token expiration
        localVerifyToken.expires_at = originalExpire;
        await localVerifyToken.save();
    });

    // Test case: Verifying user email GET request (FAIL): Invalid token action name
    test('(FAIL): Invalid token action name', async () => {
        // Fetch the local verification token by ID
        const localVerifyToken = await ActionToken.findById(localVerifyTokenId);

        // Modify token action name to an invalid value
        localVerifyToken.action_name = "tractor";
        await localVerifyToken.save();

        // Make a GET request to verify email
        const response = await request(app)
            .get(`/api/auth/verify-email/${localVerifyTokenId}`)
            .send();

        // Assertions: Check if the response status is 403 (Forbidden)
        // and if the error message is "Invalid token action name"
        expect(response.status).toBe(403);
        expect(response._body.error).toBe("Invalid token action name");

        // Restore the original token action name
        localVerifyToken.action_name = "registration_verification";
        await localVerifyToken.save();
    });

    // Test case: Verifying user email GET request (FAIL): User doesn't exist
    test('(FAIL): User does not exist', async () => {
        // Fetch the local verification token by ID
        const localVerifyToken = await ActionToken.findById(localVerifyTokenId);

        // Modify token entity ID to an invalid value
        const originalEntityId = localVerifyToken.entity_id;
        localVerifyToken.entity_id = "tractor";
        await localVerifyToken.save();

        // Make a GET request to verify email
        const response = await request(app)
            .get(`/api/auth/verify-email/${localVerifyTokenId}`)
            .send();

        // Assertions: Check if the response status is 404 (Not Found)
        // and if the error message is "User doesn't exist"
        expect(response.status).toBe(404);
        expect(response._body.error).toBe("User doesn't exist");

        // Restore the original token entity ID
        localVerifyToken.entity_id = originalEntityId;
        await localVerifyToken.save();
    });

    // Test case: Verifying user email GET request (FAIL): Invalid token provided
    test('(FAIL): Invalid token provided', async () => {
        // Attempt to verify email with various invalid token values
        const invalidToken = `@¨¨̧¨̧@¨¨̧¨̧@¨¨̧¨̧@¨¨̧¨̧@¨¨̧¨̧@¨¨̧¨̧@¨¨̧¨̧`;
        let response = await request(app)
            .get(`/api/auth/verify-email/${encodeURIComponent(invalidToken)}`)
            .send();
        
        // Assertions: Check if the response status is 400 (Bad Request)
        expect(response.status).toBe(400);

        // Attempt to verify email with null and undefined token values
        response = await request(app)
            .get(`/api/auth/verify-email/${null}`)
            .send();
        expect(response.status).toBe(400);

        response = await request(app)
            .get(`/api/auth/verify-email/${undefined}`)
            .send();
        expect(response.status).toBe(400);
    });

    // Test case: Verifying user email GET request (FAIL): Token not found
    test('(FAIL): Token not found', async () => {
        // Attempt to verify email with an invalid token
        const invalidToken = '28e293b5-003e-400b-a6f5-92acc7629434';
        let response = await request(app)
            .get(`/api/auth/verify-email/${encodeURIComponent(invalidToken)}`)
            .send();
        
        // Assertions: Check if the response status is 403 (Forbidden)
        // and if the error message is "Invalid token or expired"
        expect(response.status).toBe(403);
        expect(response._body.error).toBe("Invalid token or expired");
    });

    // Test case: Verifying user email GET request (SUCCESS): Verified user email
    test('(SUCCESS): Verified user email', async () => {
        // Make a GET request to verify email
        const response = await request(app)
            .get(`/api/auth/verify-email/${localVerifyTokenId}`)
            .send();
        
        // Assertions: Check if the response status is 200 (OK)
        // and if the message is "Email verified successfully"
        expect(response.status).toBe(200);
        expect(response._body.message).toBe("Email verified successfully");
    });

    // Test case: Verifying user email GET request (FAIL): Email already verified
    test('(FAIL): Email already verified', async () => {
        // Attempt to verify already verified email
        const response = await request(app)
            .get(`/api/auth/verify-email/${localVerifyTokenId}`)
            .send();

        // Assertions: Check if the response status is 200 (OK)
        // and if the message is "Email already verified"
        expect(response.status).toBe(200);
        expect(response._body.message).toBe("Email already verified");
    });

    // Test case: Resend user email(FAIL): Email already verified
    test('Resend user email(FAIL): Email already verified', async () => {
        // User information for the request
        const userInfo = {
            email: 'jasminko@gmail.com',
            password: 'jasminko123',
        };

        // Make a GET request to resend email verification
        const response = await request(app)
            .get('/api/auth/resend-verify-token')
            .send(userInfo);

        // Assertions: Check if the response status is 200 (OK)
        // and if the message is "Email already verified"
        expect(response.status).toBe(200);
        expect(response._body.message).toBe("Email already verified");
    });
});







// Test suite for logging in user
describe('Logging in user', () => {
    // Test case: Invalid user email (FAIL)
    test('(FAIL): Invalid user email', async () => {
        // User information with an invalid email
        const userInfo = {
            email: 'jasmil.com',
            password: 'jasminko123',
        };

        // Make a POST request to log in user
        const response = await request(app)
            .post('/api/auth/login')
            .send(userInfo);

        // Assertions: Check if the response status is 400 (Bad Request)
        expect(response.status).toBe(400);
    });

    // Test case: Invalid user password (FAIL)
    test('(FAIL): Invalid user password', async () => {
        // User information with an invalid password
        const userInfo = {
            email: 'jasminko@gmail.com',
            password: 'j3',
        };

        // Make a POST request to log in user
        const response = await request(app)
            .post('/api/auth/login')
            .send(userInfo);

        // Assertions: Check if the response status is 400 (Bad Request)
        expect(response.status).toBe(400);
    });

    // Test case: User not found (FAIL)
    test('(FAIL): User not found', async () => {
        // User information with a non-existent email
        const userInfo = {
            email: 'jasminko111@gmail.com',
            password: 'jasminko123',
        };

        // Make a POST request to log in user
        const response = await request(app)
            .post('/api/auth/login')
            .send(userInfo);

        // Assertions: Check if the response status is 404 (Not Found)
        // and if the error message is 'User not found'
        expect(response.status).toBe(404);
        expect(response._body.error).toBe('User not found');
    });

    // Test case: Password does not match (FAIL)
    test('(FAIL): Password does not match', async () => {
        // User information with a mismatched password
        const userInfo = {
            email: 'jasminko@gmail.com',
            password: 'jasinko1235',
        };

        // Make a POST request to log in user
        const response = await request(app)
            .post('/api/auth/login')
            .send(userInfo);

        // Assertions: Check if the response status is 400 (Bad Request)
        // and if the error message is 'Password does not match'
        expect(response.status).toBe(400);
        expect(response._body.error).toBe('Password does not match');
    });

    // Test case: User successfully logged in (SUCCESS)
    test('(SUCCESS): User successfully logged in', async () => {
        // User information with correct credentials
        const userInfo = {
            email: 'jasminko@gmail.com',
            password: 'jasminko123',
        };

        // Make a POST request to log in user
        const response = await request(app)
            .post('/api/auth/login')
            .send(userInfo);

        // Assertions: Check if the response status is 200 (OK)
        // and if user and JWT token are defined in the response body
        expect(response.status).toBe(200);
        expect(response._body.user).toBeDefined();
        expect(response._body.JwtToken).toBeDefined();

        // Save cookies for further testing
        cookies = response.headers['set-cookie'];
    });

    // Test case: User already logged in (FAIL)
    test('(FAIL): User already logged in', async () => {
        // User information with correct credentials
        const userInfo = {
            email: 'jasminko@gmail.com',
            password: 'jasminko123',
        };

        // Make a POST request to log in user with saved cookies
        const response = await request(app)
            .post('/api/auth/login')
            .set('Cookie', cookies)
            .send(userInfo);

        // Assertions: Check if the response status is 409 (Conflict)
        // and if the message is "User already logged in"
        expect(response.status).toBe(409);
        expect(response._body.message).toBe("User already logged in");
    });
});


// Test suite for logging out user
describe('Logging out user', () => {
    // Test case for attempting to log out when the user is not logged in
    test('(FAIL): User not logged in', async () => {
        const response = await request(app)
            .post('/api/auth/logout')
            .send();

        // Assertion: Check if the response status is 401 (Unauthorized)
        expect(response.status).toBe(401);
    });

    // Test case for successfully logging out a user
    test('(SUCCESS): Logged out user', async () => {
        const response = await request(app)
            .post('/api/auth/logout')
            .set('Cookie', cookies) // Set the authentication cookie
            .send();

        // Assertions: Check if the response status is 200 (OK)
        // and if the response message is "Logout successful"
        expect(response.status).toBe(200);
        expect(response._body.message).toBe("Logout successful");

        // Attempt to log in again with valid user credentials
        const userInfo = {
            email: 'jasminko@gmail.com',
            password: 'jasminko123',
        };

        // Make a POST request to log in the user
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send(userInfo);

        // Assertions: Check if the login response status is 200 (OK)
        // and if the user and JWT token are defined in the response body
        expect(loginResponse.status).toBe(200);
        expect(loginResponse._body.user).toBeDefined();
        expect(loginResponse._body.JwtToken).toBeDefined();

        // Save cookies for further testing
        cookies = loginResponse.headers['set-cookie'];
    });
});






// Test suite for shortening URL
describe('Shortening URL', () => {
    // Test case: LongURL not URL (FAIL)
    test('(FAIL): LongURL not URL', async () => {
        // URL information with a non-URL longURL
        const urlInfo = {
            longURL: "notURL",
            customShortCode: "code",
        }

        // Make a POST request to shorten URL
        const response = await request(app)
            .post('/api/url/shorten')
            .set('Cookie', cookies)
            .send(urlInfo);

        // Assertions: Check if the response status is 400 (Bad Request)
        expect(response.status).toBe(400);
    });

    // Test case: Invalid custom short code (FAIL)
    test('(FAIL): Invalid custom short code', async () => {
        // Invalid custom short code containing special characters
        const invalidCode = `@¨¨̧¨̧@¨¨̧¨̧@¨¨̧¨̧@¨¨̧¨̧@¨¨̧¨̧@¨¨̧¨̧@¨¨̧¨̧`;
        const urlInfo = {
            longURL: "https://www.youtube.com/",
            customShortCode: invalidCode,
        }

        // Make a POST request to shorten URL
        const response = await request(app)
            .post('/api/url/shorten')
            .set('Cookie', cookies)
            .send(urlInfo);

        // Assertions: Check if the response status is 400 (Bad Request)
        expect(response.status).toBe(400);
    });

    // Test case: Invalid custom short code (empty) (FAIL)
    test('(FAIL): Invalid custom short code(empty)', async () => {
        // URL information with an empty custom short code
        const urlInfo = {
            longURL: "https://www.youtube.com/",
            customShortCode: "",
        }

        // Make a POST request to shorten URL
        const response = await request(app)
            .post('/api/url/shorten')
            .set('Cookie', cookies)
            .send(urlInfo);

        // Assertions: Check if the response status is 400 (Bad Request)
        expect(response.status).toBe(400);
    });

    // Test case: Created shortened URL (SUCCESS)
    test('(SUCCESS): Created shortened URL', async () => {
        // URL information with a valid longURL and custom short code
        const urlInfo = {
            longURL: "https://www.youtube.com/",
            customShortCode: "yt",
        }

        // Make a POST request to shorten URL
        const response = await request(app)
            .post('/api/url/shorten')
            .set('Cookie', cookies)
            .send(urlInfo);

        // Save the created short URL ID for further testing
        localShortUrlId = response._body._id;

        // Assertions: Check if the response status is 201 (Created)
        expect(response.status).toBe(201);
    });
});






// Test suite for retrieving the long URL for a ShortURL
describe('Retrieve the long URL for a ShortURL', () => {
    // Test case for successfully retrieving the long URL
    test('(SUCCESS): Retrieved long URL', async () => {
        // Retrieve the shortURL document from the localShortUrlId
        const shortURL = await ShortURL.findById(localShortUrlId);
        // Extract the shortCode from the retrieved shortURL
        const shortCode = shortURL.shortCode;

        // Make a GET request to the show-long-url endpoint with the valid shortCode
        const response = await request(app)
            .get(`/api/url/${shortCode}/show-long-url`)
            .set('Cookie', cookies)
            .send();

        // Assert that the response status is 200 (Success)
        expect(response.status).toBe(200);
    });

    // Test case for handling an invalid short code
    test('(FAIL): Invalid short code', async () => {
        // Define an invalid short code with special characters
        const invalidShortCode = `@¨¨̧¨̧@¨¨̧¨̧@¨¨̧¨̧@¨¨̧¨̧@¨¨̧¨̧@¨¨̧¨̧@¨¨̧¨̧`;
        // Make a GET request to the show-long-url endpoint with the invalid short code
        const response = await request(app)
            .get(`/api/url/${encodeURIComponent(invalidShortCode)}/show-long-url`)
            .set('Cookie', cookies)
            .send();

        // Assert that the response status is 400 (Bad Request)
        expect(response.status).toBe(400);
    });

    // Test case for handling an empty short code
    test('(FAIL): Empty short code', async () => {
        // Define an empty short code
        const invalidShortCode = "";
        // Make a GET request to the show-long-url endpoint with the empty short code
        const response = await request(app)
            .get(`/api/url/${invalidShortCode}/show-long-url`)
            .set('Cookie', cookies)
            .send();

        // Assert that the response status is 400 (Bad Request)
        expect(response.status).toBe(400);
    });

    // Test case for handling a non-existent short code
    test('(FAIL): Short code not found', async () => {
        // Define a non-existent short code
        const invalidShortCode = "lgkimrdsomagidfos";
        // Make a GET request to the show-long-url endpoint with the non-existent short code
        const response = await request(app)
            .get(`/api/url/${invalidShortCode}/show-long-url`)
            .set('Cookie', cookies)
            .send();

        // Assert that the response status is 404 (Not Found)
        expect(response.status).toBe(404);
    });
});






// Test suite for redirecting user on short code input
describe('Redirect user on short code input', () => {
    // Test case: Invalid short code (FAIL)
    test('(FAIL): Invalid short code', async () => {
        // Make a GET request to redirect user with an invalid short code
        const response = await request(app)
            .get('/api/url/tractor')
            .set('Cookie', cookies)
            .send();

        // Assertions: Check if the response status is 404 (Not Found) and error message is as expected
        expect(response.status).toBe(404);
        expect(response._body.error).toBe("Short code not found");
    });

    // Test case: Redirected user to longURL (SUCCESS)
    test('(SUCCESS): Redirected user to longURL', async () => {
        // Make a GET request to redirect user with a valid short code
        const response = await request(app)
            .get(`/api/url/yt`)
            .set('Cookie', cookies)
            .send();

        // Assertions: Check if the response status is 302 (Found)
        expect(response.status).toBe(302);
    });
});







// Test suite for listing shortURLs for logged-in User
describe('List shortURLs for logged-in User', () => {
    // Test case: Listed user urls (SUCCESS)
    test('(SUCCESS): Listed user urls', async () => {
        // Make a GET request to list short URLs for the logged-in user
        const response = await request(app)
            .get(`/api/url/list/logged-user`)
            .set('Cookie', cookies)
            .send();

        // Assertions: Check if the response status is 200 (OK)
        expect(response.status).toBe(200);
    });

    // Test case: No urls found under current user (SUCCESS)
    test('(SUCCESS): No urls found under current user', async () => {
        // Change the userId of the local short URL to simulate no URLs found
        const localShortUrl = await ShortURL.findById(localShortUrlId);
        localShortUrl.userId = String.fromCharCode(localShortUrl.userId.charCodeAt(0) + 1) + localShortUrl.userId.slice(1);
        await localShortUrl.save();

        // Make a GET request to list short URLs for the logged-in user
        const response = await request(app)
            .get(`/api/url/list/logged-user`)
            .set('Cookie', cookies)
            .send();

        // Assertions: Check if the response status is 204 (No Content)
        expect(response.status).toBe(204);

        // Revert the change to the userId
        localShortUrl.userId = String.fromCharCode(localShortUrl.userId.charCodeAt(0) - 1) + localShortUrl.userId.slice(1);
        await localShortUrl.save();
    });

    // Test case: User not logged in (FAIL)
    test('(FAIL): User not logged in', async () => {
        // Make a GET request to list short URLs without providing cookies
        const response = await request(app)
            .get(`/api/url/list/logged-user`)
            .send();

        // Assertions: Check if the response status is 401 (Unauthorized)
        expect(response.status).toBe(401);
    });
});






// Test suite for updating shortURLs for logged-in User
describe('Update shortURLs for logged-in User', () => {
    // Test case: Updated user url short code (SUCCESS)
    test('(SUCCESS): Updated user url short code', async () => {
        // Make a PATCH request to update the short code of the local short URL
        const response = await request(app)
            .patch(`/api/url/update/${localShortUrlId}`)
            .set('Cookie', cookies)
            .send({ customShortCode: "randomShortCode9454" });

        // Assertions: Check if the response status is 200 (OK)
        expect(response.status).toBe(200);
    });

    // Test case: ShortURL ID not found (FAIL)
    test('(FAIL): ShortURL ID not found', async () => {
        // Generate a random UUID
        const randomUUID = "5b163aa1-7889-4315-a3c5-1eee3b21839e";

        // Make a PATCH request to update the short code using a non-existent short URL ID
        const response = await request(app)
            .patch(`/api/url/update/${randomUUID}`)
            .set('Cookie', cookies)
            .send({ customShortCode: "randomShortCode511" });

        // Assertions: Check if the response status is 404 (Not Found)
        expect(response.status).toBe(404);
    });

    // Test case: ShortURL ID is not UUID (FAIL)
    test('(FAIL): ShortURL ID is not UUID', async () => {
        // Invalid short URL ID (not a UUID)
        const invalidUUID = "tractorwhat";

        // Make a PATCH request to update the short code using an invalid short URL ID
        const response = await request(app)
            .patch(`/api/url/update/${invalidUUID}`)
            .set('Cookie', cookies)
            .send({ customShortCode: "randomShortCode353" });

        // Assertions: Check if the response status is 400 (Bad Request)
        expect(response.status).toBe(400);
    });

    // Test case: Short code is empty (FAIL)
    test('(FAIL): Short code is empty', async () => {
        // Make a PATCH request to update the short code with an empty value
        const response = await request(app)
            .patch(`/api/url/update/${localShortUrlId}`)
            .set('Cookie', cookies)
            .send({ customShortCode: "" });

        // Assertions: Check if the response status is 400 (Bad Request)
        expect(response.status).toBe(400);
    });

    // Test case: User not logged in (FAIL)
    test('(FAIL): User not logged in', async () => {
        // Make a PATCH request to update the short code without providing cookies
        const response = await request(app)
            .patch(`/api/url/update/${localShortUrlId}`)
            .send({ customShortCode: "randomShortCode3518" });

        // Assertions: Check if the response status is 401 (Unauthorized)
        expect(response.status).toBe(401);
    });
});







// Test suite for deleting shortURLs for logged-in User
describe('Delete shortURLs for logged-in User', () => {
    // Test case: User not logged in (FAIL)
    test('(FAIL): User not logged in', async () => {
        // Make a DELETE request to delete the short URL without providing cookies
        const response = await request(app)
            .delete(`/api/url/delete/${localShortUrlId}`)
            .send();

        // Assertions: Check if the response status is 401 (Unauthorized)
        expect(response.status).toBe(401);
    });

    // Test case: ShortURL ID is found (FAIL)
    test('(FAIL): ShortURL ID is found', async () => {
        // Generate a random UUID
        const randomUUID = "5b163aa1-7889-4315-a3c5-1eee3b21839e";

        // Make a DELETE request to delete a short URL using a non-existent short URL ID
        const response = await request(app)
            .delete(`/api/url/delete/${randomUUID}`)
            .set('Cookie', cookies)
            .send();

        // Assertions: Check if the response status is 404 (Not Found)
        expect(response.status).toBe(404);
    });

    // Test case: ShortURL ID is not UUID (FAIL)
    test('(FAIL): ShortURL ID is not UUID', async () => {
        // Invalid short URL ID (not a UUID)
        const invalidUUID = "tractor";

        // Make a DELETE request to delete a short URL using an invalid short URL ID
        const response = await request(app)
            .delete(`/api/url/delete/${invalidUUID}`)
            .set('Cookie', cookies)
            .send();

        // Assertions: Check if the response status is 400 (Bad Request)
        expect(response.status).toBe(400);
    });

    // Test case: Deleted shortURL (SUCCESS)
    test('(SUCCESS): Deleted shortURL', async () => {
        // Make a DELETE request to delete the local short URL
        const response = await request(app)
            .delete(`/api/url/delete/${localShortUrlId}`)
            .set('Cookie', cookies)
            .send();

        // Assertions: Check if the response status is 200 (OK)
        expect(response.status).toBe(200);
    });
});




const validActions = require('../public/actions');
// Test suite for updating user
describe('Update user', () => {
    // Test case: Updated previous user's username and email (SUCCESS)
    test("(SUCCESS): Updated previous user's username and email", async () => {
        // New user data with updated username and email
        const newUser = {
            username: "fattey",
            email: "fettay@gmail.com",
        };

        // Make a PATCH request to update the user data
        const response = await request(app)
            .patch('/api/users')
            .set('Cookie', cookies)
            .send(newUser);

        // Assertions: Check if the response status is 200 (OK) and updated data is as expected
        expect(response.status).toBe(200);
        expect(response._body.username).toBe(newUser.username);
        expect(response._body.email).toBe(newUser.email);
    });

    // Test case: Updated only previous user's username (SUCCESS)
    test("(SUCCESS): Updated only previous user's username", async () => {
        // New user data with updated username
        const newUser = {
            username: "AAAAAJAKETsy",
        };

        // Make a PATCH request to update the user data
        const response = await request(app)
            .patch('/api/users')
            .set('Cookie', cookies)
            .send(newUser);

        // Assertions: Check if the response status is 200 (OK) and updated data is as expected
        expect(response.status).toBe(200);
        expect(response._body.username).toBe(newUser.username);
    });

    // Test case: Updated only previous user's email (SUCCESS)
    test("(SUCCESS): Updated only previous user's email", async () => {
        // New user data with updated email
        const newUser = {
            email: "randomMail@gmail.com",
        };

        // Make a PATCH request to update the user data
        const response = await request(app)
            .patch('/api/users')
            .set('Cookie', cookies)
            .send(newUser);

        // Assertions: Check if the response status is 200 (OK) and updated data is as expected
        expect(response.status).toBe(200);
        expect(response._body.email).toBe(newUser.email);
    });

    // Test case: Trying to update existing data to same data (FAIL)
    test("(FAIL): Trying to update existing data to same data", async () => {
        // New user data with the same username and email as previous
        const newUser = {
            username: "AAAAAJAKETsy",
            email: "randomMail@gmail.com",
        };

        // Make a PATCH request to update the user data with the same data
        const response = await request(app)
            .patch('/api/users')
            .set('Cookie', cookies)
            .send(newUser);

        // Assertions: Check if the response status is 400 (Bad Request) and error message is as expected
        expect(response.status).toBe(400);
        expect(response._body.error).toBe("Invalid update data");
    });
});


// Test suite for paginated user logs
describe('Paginated User Logs', () => {
    // Failure tests for invalid sortField, sortOrder, page, pageSize, filterByAction
    test("(FAIL): Sort field not valid", async () => {
        // Make a request with an invalid sortField
        const response = await request(app)
            .get(`/api/userLogs?sortField=sufnsdfu`)
            .set('Cookie', cookies)
            .send();

        // Expect a 400 Bad Request response
        expect(response.status).toBe(400);
    });

    test("(FAIL): sortOrder field not valid", async () => {
        // Make a request with an invalid sortOrder
        const response = await request(app)
            .get(`/api/userLogs?sortOrder=sufnsdfu`)
            .set('Cookie', cookies)
            .send();

        expect(response.status).toBe(400);
    });

    test("(FAIL): page field not valid", async () => {
        // Make a request with an invalid page
        const response = await request(app)
            .get(`/api/userLogs?page=sufnsdfu`)
            .set('Cookie', cookies)
            .send();

        expect(response.status).toBe(400);
    });

    test("(FAIL): pageSize field not valid", async () => {
        // Make a request with an invalid pageSize
        const response = await request(app)
            .get(`/api/userLogs?pageSize=sufnsdfu`)
            .set('Cookie', cookies)
            .send();

        expect(response.status).toBe(400);
    });

    test("(FAIL): filterByAction field not valid", async () => {
        // Make a request with an invalid filterByAction
        const response = await request(app)
            .get(`/api/userLogs?filterByAction=sufnsdfu`)
            .set('Cookie', cookies)
            .send();

        expect(response.status).toBe(400);
    });

    // Success tests for valid sortField requests
    const sortFields = ['description', 'action', 'timestamp'];
    test.each(sortFields)(
        "(SUCCESS): Sort field valid requests - %s",
        async (sortField) => {
            // Make a request with a valid sortField and sortOrder
            const response = await request(app)
                .get(`/api/userLogs?sortField=${sortField}&sortOrder=asc`)
                .set('Cookie', cookies)
                .send();

            // Expect a 200 OK response
            expect(response.status).toBe(200);

            // Check if the logs are sorted by the specified field in ascending order
            const logs = response._body.logs;

            // Function to check if logs are sorted
            const isSorted = (logs, field) => {
                for (let i = 1; i < logs.length; i++) {
                    if (logs[i - 1][field] > logs[i][field]) {
                        return false;
                    }
                }
                return true;
            };

            // Expect logs to be sorted by the specified field in ascending order
            expect(isSorted(logs, sortField)).toBe(true);
        }
    );

    // Success tests for valid sortOrder requests
    const sortOrders = ['asc', 'desc'];
    test.each(sortOrders)(
        "(SUCCESS): Sort order valid requests - %s",
        async (sortOrder) => {
            // Make a request with a valid sortOrder
            const response = await request(app)
                .get(`/api/userLogs?sortField=timestamp&sortOrder=${sortOrder}`)
                .set('Cookie', cookies)
                .send();

            // Expect a 200 OK response
            expect(response.status).toBe(200);

            // Check if the logs are sorted by timestamp and order
            const logs = response._body.logs;

            // Function to check if logs are sorted
            const isSorted = (logs, field, order) => {
                for (let i = 1; i < logs.length; i++) {
                    const comparison = order === 'asc' ? 1 : -1;
                    if (new Date(logs[i - 1][field]) * comparison > new Date(logs[i][field]) * comparison) {
                        return false;
                    }
                }
                return true;
            };

            // Expect logs to be sorted by timestamp in the specified order
            expect(isSorted(logs, 'timestamp', sortOrder)).toBe(true);
        }
    );

    // Success tests for page and pageSize requests
    test("(SUCCESS): page accepts correct page number", async () => {
        // Make a request with a valid page and pageSize
        const response = await request(app)
            .get(`/api/userLogs?page=1&pageSize=2`)
            .set('Cookie', cookies)
            .send();

        // Expect a 200 OK response
        expect(response.status).toBe(200);

        // Validate the structure of the response
        expect(response.body).toHaveProperty('logs');
        expect(Array.isArray(response.body.logs)).toBe(true);

        // Validate the expected number of logs based on pageSize and page
        expect(response.body.logs.length).toBe(2);
    });

    test("(SUCCESS): pageSize displays correct page size", async () => {
        // Make a request with a valid page and pageSize
        const response = await request(app)
            .get(`/api/userLogs?page=1&pageSize=3`)
            .set('Cookie', cookies)
            .send();

        // Expect a 200 OK response
        expect(response.status).toBe(200);

        // Validate the structure of the response
        expect(response.body).toHaveProperty('logs');
        expect(Array.isArray(response.body.logs)).toBe(true);

        // Validate the expected number of logs based on pageSize and page
        expect(response.body.logs.length).toBe(3);
    });

    // Success tests for filterByAction requests
    test.each(validActions)(
        "(SUCCESS): Filter by action valid requests - %s",
        async (validAction) => {
            // Make a request with a valid filterByAction
            const response = await request(app)
                .get(`/api/userLogs?filterByAction=${validAction}`)
                .set('Cookie', cookies)
                .send();

            // Expect a 200 OK response
            expect(response.status).toBe(200);

            // Check if all logs have the expected action
            if (response._body.logs.length > 0) {
                const allLogsHaveExpectedAction = response._body.logs.every((log) => log.action === validAction);
                expect(allLogsHaveExpectedAction).toBe(true);
            }
        }
    );

    // Combined success test for multiple requests
    test("(SUCCESS): Combined requests", async () => {
        const response = await request(app)
            .get('/api/userLogs')
            .query({
                search: 'a',
                sortField: 'timestamp',
                sortOrder: 'asc',
                page: 1,
                pageSize: 2,
                filterByAction: validActions[0],
            })
            .set('Cookie', cookies)
            .send();

        // Expect a 200 OK response
        expect(response.status).toBe(200);

        // Validate the structure of the response
        expect(response.body).toHaveProperty('logs');
        expect(Array.isArray(response.body.logs)).toBe(true);

        // Validate the expected number of logs based on pageSize and page
        expect(response.body.logs.length).toBe(2);

        // Check if all logs have the expected action
        if (response.body.logs.length > 0) {
            const allLogsHaveExpectedAction = response.body.logs.every((log) => log.action === validActions[0]);
            expect(allLogsHaveExpectedAction).toBe(true);
        }
    });
});