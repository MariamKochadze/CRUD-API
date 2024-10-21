import request from 'supertest';
import express from 'express';
import { initializeDatabase } from '../database'; // Adjust the import path as necessary
import userRouter from '../routes/routes'; // Adjust the import path as necessary

const app = express();
app.use(express.json());
app.use('/api', userRouter); // Assuming you have the routes set up like this

describe('User API', () => {
    beforeEach(() => {
        // Reinitialize the database before each test
        initializeDatabase(false);
    });

    it('should return an empty array on GET /api/users', async () => {
        const response = await request(app).get('/api/users');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]); // Expecting an empty array
    });

    it('should create a new user on POST /api/users', async () => {
        const newUser = {
            username: "Alice Walker",
            age: 28,
            hobbies: ["writing", "reading"]
        };

        const response = await request(app)
            .post('/api/users')
            .send(newUser)
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id'); // Check if ID is created
        expect(response.body.username).toBe(newUser.username);
        expect(response.body.age).toBe(newUser.age);
        expect(response.body.hobbies).toEqual(newUser.hobbies);
    });

    it('should get a user by ID on GET /api/users/:userId', async () => {
        const newUser = {
            username: "Alice Walker",
            age: 28,
            hobbies: ["writing", "reading"]
        };

        const createdUser = await request(app)
            .post('/api/users')
            .send(newUser)
            .set('Content-Type', 'application/json');

        const userId = createdUser.body.id; // Store the created user's ID

        const response = await request(app).get(`/api/users/${userId}`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(createdUser.body); // Expecting the created user
    });

    it('should update a user on PUT /api/users/:userId', async () => {
        const newUser = {
            username: "Alice Walker",
            age: 28,
            hobbies: ["writing", "reading"]
        };

        const createdUser = await request(app)
            .post('/api/users')
            .send(newUser)
            .set('Content-Type', 'application/json');

        const userId = createdUser.body.id; // Store the created user's ID

        const updatedUser = {
            username: "Alice Updated",
            age: 30,
            hobbies: ["writing", "traveling"]
        };

        const response = await request(app)
            .put(`/api/users/${userId}`)
            .send(updatedUser)
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ ...updatedUser, id: userId }); // Expecting updated user details
    });

    it('should delete a user on DELETE /api/users/:userId', async () => {
        const newUser = {
            username: "Alice Walker",
            age: 28,
            hobbies: ["writing", "reading"]
        };

        const createdUser = await request(app)
            .post('/api/users')
            .send(newUser)
            .set('Content-Type', 'application/json');

        const userId = createdUser.body.id; // Store the created user's ID

        const response = await request(app).delete(`/api/users/${userId}`);
        expect(response.status).toBe(204); // No content on successful deletion

        // Verify that the user no longer exists
        const getResponse = await request(app).get(`/api/users/${userId}`);
        expect(getResponse.status).toBe(404); // Expecting not found status
        expect(getResponse.body).toEqual({ message: 'User not found' });
    });
});
