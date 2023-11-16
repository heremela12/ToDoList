const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;
app.set("view engine", "ejs"); // Set EJS as the view engine
app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const uri =
  "mongodb+srv://heremela:hermela1234@todo.ztqxvqe.mongodb.net/Todo?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // Route to render the form
    app.get("/", async (req, res) => {
      try {
        // Fetch all todos from the database
        const todos = await client
          .db("Todo")
          .collection("todos")
          .find()
          .toArray();

        // Filter out todos with a specific title
        const filteredTodos = todos.filter(
          (todo) => todo.title !== req.body.title
        );

        // Render the index page with the filtered todos
        res.render("index", { todos: filteredTodos });
      } catch (error) {
        console.error("Error fetching todos:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    // Route to handle form submission
    app.post("/submit-form", async (req, res) => {
      const title = req.body.title;
      const newTodo = { title: title };

      try {
        // Check if a todo with the same title already exists
        const existingTodo = await client
          .db("Todo")
          .collection("todos")
          .findOne({ title: newTodo.title });

        if (!existingTodo) {
          // If no existing todo, insert the new todo
          await client.db("Todo").collection("todos").insertOne(newTodo);
          console.log("New todo saved:", newTodo);
        } else {
          console.log(
            `Todo with title '${newTodo.title}' already exists. Skipping insertion.`
          );
        }

        // Fetch all todos (including the newly inserted one, if any)
        const todos = await client
          .db("Todo")
          .collection("todos")
          .find()
          .toArray();

        res.render("index", { todos: todos }); // Redirect to the home page after form submission
      } catch (error) {
        console.error("Error saving todo:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    //Route to handle task deletion
    app.post("/deleteTodo", async (req, res) => {
      const todoId = req.body.todoId;

      try {
        // Use MongoDB's deleteOne method to remove the todo with the given ID
        const result = await client
          .db("Todo")
          .collection("todos")
          .deleteOne({ _id: new ObjectId(todoId) });

        if (result.deletedCount === 1) {
          console.log("Todo item deleted successfully");
        } else {
          console.log(`Todo item with ID ${todoId} not found`);
        }

        // Redirect to the home page after deletion
        res.redirect("/"); // Redirect to the home page
      } catch (error) {
        console.error("Error deleting todo:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    //////////////////////////////////////////////////////////////////////////////////////
    app.listen(PORT, () => {
      console.log("Server is running on port 3000");
    });
  } finally {
  }
}

run().catch(console.dir);
