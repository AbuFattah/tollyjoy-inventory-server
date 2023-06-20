const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();

// middleware
app.use(cors());
app.use(express.json());
// verify token middleware
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
      // make sure to return on error since we don't want to continue anymore'
    }

    req.decoded = decoded;
    next();
  });
  // console.log("inside verifyJWT", authHeader);
}

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

    // get all products
    app.get("/products", async (req, res) => {
      const cursor = products.find({});
      const fetchedProducts = await cursor.toArray();
      res.send(fetchedProducts);
    });
    // get featured products
    app.get("/featuredProducts", async (req, res) => {
      // const query = { featured: true };
      const cursor = products.find({}).limit(6);
      const featuredProducts = await cursor.toArray();
      console.log(featuredProducts);
      res.send(featuredProducts);
    });

    // ? USE verifyJWT middleware
    // Get my products
    app.get("/products/:email", verifyJWT, async (req, res) => {
      const { email } = req.params;
      // console.log(req.params);
      // Forbid access if request email and access token payload email dont match
      if (email !== req.decoded?.email) {
        return res.status(403).send({ message: "Forbidden access" });
      }
      const cursor = products.find({ email });
      const fetchedProducts = await cursor.toArray();
      res.send(fetchedProducts);
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

    // update stock
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

    // delete product by id
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await products.deleteOne(query);
      if (result.deletedCount === 1) {
        res.send("delete success");
        console.log("Successfully deleted one document.");
      } else {
        console.log("No documents matched the query. Deleted 0 documents.");
        res.send("delete failed");
      }
    });

    // Add new inventory item
    app.post("/inventories/add", async (req, res) => {
      // const { itemName, price, supplier, quantity, email, imageUrl } = req.body;
      const doc = req.body;
      console.log(req.body);
      const result = await products.insertOne(doc);
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
      res.send(`A document was inserted with the _id: ${result.insertedId}`);
    });

    // CREATE TOKEN
    app.post("/createToken", (req, res) => {
      const payload = req.body;
      const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      console.log(accessToken);
      res.send({ accessToken });
    });
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("listen on port", port);
});
