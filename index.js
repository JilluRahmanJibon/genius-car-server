const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 8000;

// middle wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jf2skzr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

function verifyJWT(req, res, next) {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).send({ message: "unAuthorized access" });
	}
	const token = authHeader.split(" ")[1];
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
		if (err) {
			return res.status(403).send({ message: "unAuthorized access" });
		}
		req.decoded = decoded;
		next();
	});
}

async function run() {
	const servicesCollection = client.db("geniusCar").collection("services");
	const orderConnection = client.db("geniusCar").collection("orders");

	app.post("/jwt", (req, res) => {
		const user = req.body;
		const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
			expiresIn: "20h",
		});
		res.send({ token });
	});
	app.get("/services", async (req, res) => {
		const query = {};
		const cursor = servicesCollection.find(query);
		const services = await cursor.toArray();
		res.send(services);
	});
	app.get("/services/:id", async (req, res) => {
		const { id } = req.params;
		const query = { _id: ObjectId(id) };
		const service = await servicesCollection.findOne(query);
		res.send(service);
	});

	// orders api
	app.get("/orders", verifyJWT, async (req, res) => {
		const decoded = req.decoded;
		if (decoded.email !== req.query.email) {
			res.status(403).send({ message: "unAuthorized access" });
		}
		let query = {};
		if (req.query.email) {
			query = {
				email: req.query.email,
			};
		}
		const cursor = orderConnection.find(query);
		const orders = await cursor.toArray();
		res.send(orders);
	});

	app.post("/orders", async (req, res) => {
		const order = req.body;
		const result = await orderConnection.insertOne(order);
		res.send(result);
		console.log(result);
	});
	app.patch("/orders/:id", async (req, res) => {
		const { id } = req.params;
		const status = req.body.status;
		const query = { _id: ObjectId(id) };
		const updateDoc = {
			$set: {
				status: status,
			},
		};
		const result = await orderConnection.updateOne(query, updateDoc);
		res.send(result);
	});
	app.delete("/orders/:id", async (req, res) => {
		const { id } = req.params;
		const query = { _id: ObjectId(id) };
		const result = await orderConnection.deleteOne(query);
		res.send(result);
	});
}
run().catch(err => {
	console.log(err);
});

app.get("/", (req, res) => {
	res.send("now genius server is running for use");
});
app.listen(port, () => {
	console.log("genius port is running: ", port);
});
