const request = require("supertest");
const { app, server, connectDB } = require("../server");
const mongoose = require("mongoose"); // MongoDB-Modul importieren

beforeAll(async () => {
    await connectDB(); // Stelle sicher, dass die DB-Verbindung vor Tests da ist
});

afterAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Kurz warten, um hängende Prozesse zu vermeiden
    
    // **Server nur schließen, wenn er wirklich existiert**
    if (server) {
        await server.close();
    }

    // **MongoDB-Verbindung schließen, damit Jest nicht hängen bleibt**
    await mongoose.connection.close();
});

describe("Todo API Tests", () => {
    test("GET /getTodoList sollte eine Liste zurückgeben", async () => {
        const response = await request(app).get("/getTodoList");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});
