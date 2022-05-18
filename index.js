const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server running");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k0wro.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const todoCollection = client.db("tollyjoyInventory").collection("todos");

    app.get("/todos", async (req, res) => {
      const cursor = todoCollection.find({});
      const todos = await cursor.toArray();
      res.send(todos);
    });

    app.post("/todos", async (req, res) => {
      const todo = req.body;
      const result = await todoCollection.insertOne(todo);
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
      res.send(`A document was inserted with the _id: ${result.insertedId}`);
    });

    app.delete("/todos/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await todoCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("listen on port", port);
});
