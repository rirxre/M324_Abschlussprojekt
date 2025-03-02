const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
    task: {
        type: String,
        required: [true, "Task is required"],
        minlength: [3, "Task must be at least 3 characters long"],
        trim: true
    },
    status: {
        type: String,
        enum: ["open", "in progress", "done"], // ✔ Exakte Enum-Werte sicherstellen
        required: [true, "Status is required"]
    },
    deadline: {
        type: Date,
        required: [true, "Deadline is required"],
        validate: {
            validator: function (value) {
                return value > new Date();
            },
            message: "Deadline must be in the future"
        }
    }
});

// Modell exportieren
const todoList = mongoose.model("todo", todoSchema);

module.exports = todoList;
