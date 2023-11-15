const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const Todo = require("./models/todo");
const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs"); // Set EJS as the view engine
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://heremela:hermela1234@todo.ztqxvqe.mongodb.net/Todo?retryWrites=true&w=majority"; // Note the Todo in the connection string

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
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensure that the client will close when you finish/error
    await client.close();
  }
}
/*connect the db to the form in index.ejs*/
app.get("/", async (req, res) => {
  const todos = await Todo.find();
  res.render("index", { todos });
});

app.post("/todos", async (req, res) => {
  const { title } = req.body;

  try {
    await Todo.create({ title });
    const todos = await Todo.find();
    res.render("index", { todos });
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).send("Internal Server Error");
  }
});

////////////////////////////////////////////////////////////////////////////////////////////

run()
  .then(() => {
    // Start the Express app only after the connection and population are done
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch(console.dir);
