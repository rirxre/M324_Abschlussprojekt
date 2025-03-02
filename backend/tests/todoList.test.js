const request = require("supertest");
const app = require("../server"); // Falls dein Server in server.js ist

test("GET /todos sollte eine Liste zurückgeben", async () => {
    const response = await request(app).get("/todos");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
});
