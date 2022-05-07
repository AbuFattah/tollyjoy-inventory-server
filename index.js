const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");
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
    const featuredProductsCollection = client
      .db("tollyjoyInventory")
      .collection("featuredProducts");

    app.get("/featuredProducts", async (req, res) => {
      const query = {};
      const cursor = featuredProductsCollection.find(query);
      const featuredProducts = await cursor.toArray();
      console.log(featuredProducts);
      res.send(featuredProducts);
    });
    // since this method returns the matched document, not a cursor, print it directly
    // console.log(featuredProducts);
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("listen on port", port);
});
