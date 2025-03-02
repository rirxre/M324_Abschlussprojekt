require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const TodoModel = require("./models/todoList");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

// Sichere MongoDB-Verbindung
async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ MongoDB connected successfully");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
}

// **WICHTIG**: Verbindung nur herstellen, wenn nicht im Testmodus
if (process.env.NODE_ENV !== "test") {
    connectDB();
}

// API-Routen
app.get("/getTodoList", async (req, res) => {
    try {
        const todoList = await TodoModel.find({});
        res.json(todoList);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/addTodoList", async (req, res) => {
    try {
        const { task, status, deadline } = req.body;

        if (!task || !status || !deadline) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const todo = await TodoModel.create(req.body);
        res.status(201).json(todo);
    } catch (err) {
        console.error("Error adding task:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.put("/updateTodoList/:id", async (req, res) => {
    try {
        console.log("📥 Eingehende Daten für Update:", req.body); // Debugging

        const { id } = req.params;
        const updatedTask = await TodoModel.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedTask) {
            return res.status(404).json({ error: "Aufgabe nicht gefunden" });
        }

        res.json(updatedTask);
    } catch (err) {
        console.error("❌ Fehler beim Aktualisieren:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.delete("/deleteTodoList/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const todo = await TodoModel.findByIdAndDelete(id);
        res.json(todo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// **Server nur starten, wenn nicht im Testmodus**
let server = null;
if (process.env.NODE_ENV !== "test") {
    server = app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

// **Exportiere App und Server für Tests**
module.exports = { app, server, connectDB };
