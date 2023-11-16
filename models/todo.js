// models/todo.js

const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true, // Index the 'title' field
  },
});

const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;
