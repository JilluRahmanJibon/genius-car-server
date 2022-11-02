const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 8000;

// middle ware s
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.send("genius car server is running for use");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jf2skzr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});
async function Run() {}
Run();

app.listen(port, () => {
	console.log("genius car port is running: ", port);
});
