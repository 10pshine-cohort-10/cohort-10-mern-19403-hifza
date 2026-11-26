const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');
const db = require('../config/db');
const expect = chai.expect;

chai.use(chaiHttp);

describe('Auth & Notes API Tests', () => {

    // Variables to hold data across tests
    let testUser = {
        name: "Test User",
        username: "testuser123",
        email: "test123@example.com",
        password: "Password#123"
    };
    let authToken = "";

    // 1. Clean up test user before starting
    before(async () => {
        await db.query('DELETE FROM users WHERE email = ?', [testUser.email]);
    });

    // 2. Clean up after tests finish
    after(async () => {
        await db.query('DELETE FROM users WHERE email = ?', [testUser.email]);
        process.exit(0); // Force Mocha to exit cleanly
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user', async function () { 
            // INCREASE TIMEOUT: Email sending takes ~3 seconds, Mocha default is 2s
            this.timeout(5000); 

            const res = await chai.request(app)
                .post('/api/auth/register')
                .send(testUser);
            
            expect(res).to.have.status(201);
            expect(res.body).to.have.property('message');
            expect(res.body.message).to.include('User Registered');
        });

        it('should fail if email is already registered', async () => {
            const res = await chai.request(app)
                .post('/api/auth/register')
                .send(testUser); // Sending the exact same user again
            
            expect(res).to.have.status(400);
            expect(res.body).to.have.property('error');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should fail if email is not verified', async () => {
            const res = await chai.request(app)
                .post('/api/auth/login')
                .send({ email: testUser.email, pass: testUser.password });
            
            // Your backend returns 403 if is_verified === 0
            expect(res).to.have.status(403); 
            expect(res.body.Error).to.equal("Please Verify Your Email First.");
        });

        it('should login successfully if user is verified (Mocking)', async () => {
            // MANUALLY VERIFY THE USER IN DB FOR THIS TEST
            await db.query('UPDATE users SET is_verified = TRUE WHERE email = ?', [testUser.email]);
            
            const res = await chai.request(app)
                .post('/api/auth/login')
                .send({ email: testUser.email, pass: testUser.password });
                
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('token');
            authToken = res.body.token; // Save token for Notes tests
        });
    });

    describe('Notes API', () => {
        let noteId = null;

        it('should FAIL to get notes without a token', async () => {
            const res = await chai.request(app).get('/api/notes');
            expect(res).to.have.status(401); // Middleware blocks it
        });

        it('should create a note successfully with a valid token', async () => {
            const res = await chai.request(app)
                .post('/api/notes')
                .set('Authorization', `Bearer ${authToken}`) // Sending the token!
                .send({ title: "Test Note", content: "<p>This is a test</p>" });
            
            expect(res).to.have.status(201);
            expect(res.body.Message).to.equal("Note is Created!");
        });

        it('should fetch the notes for the logged-in user', async () => {
            const res = await chai.request(app)
                .get('/api/notes')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.be.greaterThan(0);
            noteId = res.body[0].id; // Save the ID of the note we just created
        });

        it('should delete the note successfully', async () => {
            const res = await chai.request(app)
                .delete(`/api/notes/${noteId}`)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res).to.have.status(200);
            expect(res.body.Message).to.equal('Note Deleted Successfully');
        });
    });
});