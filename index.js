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
    const products = client.db("tollyjoyInventory").collection("inventory");

    app.get("/featuredProducts", async (req, res) => {
      const query = { featured: true };
      const cursor = products.find(query);
      const featuredProducts = await cursor.toArray();
      console.log(featuredProducts);
      res.send(featuredProducts);
    });

    // Get Product by id
    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await products.findOne(query);
      res.send(product);
    });

    // reduce stock by one
    app.put("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const updatedStock = await products.findOneAndUpdate(
        { _id: ObjectId(id) },
        { $inc: { quantity: -1 } },
        {
          returnDocument: "after",
        }
      );
      // sending the document after update
      res.send(updatedStock.value);
    });

    app.put("/restock/:id", async (req, res) => {
      const quantity = req.body.quantity;
      const id = req.params.id;
      const updatedStock = await products.findOneAndUpdate(
        { _id: ObjectId(id) },
        { $inc: { quantity: quantity } },
        {
          returnDocument: "after",
        }
      );
      // sending the document after update
      res.send(updatedStock.value);
    });
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("listen on port", port);
});
