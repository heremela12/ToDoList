const express = require("express");
const session = require("express-session");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;
app.set("view engine", "ejs"); // Set EJS as the view engine
app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    secret: "heremela1357",
    resave: false,
    saveUninitialized: true,
  })
);

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
    //route to start application
    app.get("/", async (req, res) => {
      res.render("login");
    });
    // Route to render the form
    app.get("/index", async (req, res) => {
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
        if (req.session.user) {
          // Render the index page
          res.render("index", { todos: filteredTodos });
        } else {
          // If not authenticated, redirect to the login page
          res.redirect("/login");
        }
      } catch (error) {
        console.error("Error fetching todos:", error);
        res.status(500).send("Internal Server Error");
      }
    });
    //route to render sign-up form
    app.get("/signup", async (req, res) => {
      res.render("signup");
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
    //route to handle sign up requests
    app.post("/signup-user", async (req, res) => {
      const username = req.body.username;
      const password = req.body.password;
      const repassword = req.body.repassword;
      const newuser = { username: username, password: password };

      try {
        const existinguser = await client
          .db("Todo")
          .collection("Users")
          .findOne({ username: newuser.username });

        if (!existinguser && password === repassword) {
          // If no existing user, insert the new user
          await client.db("Todo").collection("Users").insertOne(newuser);
          console.log("New user saved:", newuser);
          res.send({
            success: true,
            message: "User added successfully! Please go back and sign in!",
          });
        } else {
          res
            .status(400)
            .send("User already exists or passwords do not match!");
        }
      } catch (error) {
        console.error("Error adding user:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    // route to handle login requests
    app.post("/login", async (req, res) => {
      const username = req.body.username;
      const password = req.body.password;
      const user = { username: username, password: password };

      try {
        const existinguser = await client
          .db("Todo")
          .collection("Users")
          .findOne({ username: user.username, password: user.password });

        if (existinguser) {
          // If the user exists, store user information in the session
          req.session.user = existinguser;
          console.log("Login successful");
          return res.redirect("/index"); // Redirect to the index page after successful login
        }

        // If the user doesn't exist, handle the failed login attempt
        return res.status(400).send("Failed login. Please try again!");
      } catch (error) {
        console.error("Error logging in:", error);
        return res.status(500).send("Internal Server Error");
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
