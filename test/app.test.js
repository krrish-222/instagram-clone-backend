const request = require('supertest');
const app = require('../app');

describe("POST /api/auth/register", () => {
  it("should register a new user and return access token", async () => {
    const res = await request(app)
        .post("/api/auth/register");

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("accessToken");
  
    })
})