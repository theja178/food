const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/fooduhh";

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { timestamps: true }
);

const Food = mongoose.model("Food", foodSchema);


const express = require("express");
const cors = require("cors");  

const app = express();

app.use(cors());                
app.use(express.json());

app.get("/foods", async (req, res) => {
  try {
    const foods = await Food.find().sort({ createdAt: -1 });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch foods", error: error.message });
  }
});

app.post("/foods", async (req, res) => {
  try {
    const { name, price } = req.body;

    const newFood = new Food({
      name,
      price
    });

    await newFood.save();
    res.status(201).json(newFood);
  } catch (error) {
    res.status(400).json({ message: "Failed to create food", error: error.message });
  }
});

app.delete("/foods/:id", async (req, res) => {
  try {
    const deletedFood = await Food.findByIdAndDelete(req.params.id);
    if (!deletedFood) {
      return res.status(404).json({ message: "Food not found" });
    }

    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete food", error: error.message });
  }
});

app.put("/foods/:id", async (req, res) => {
  try {
    const { name, price } = req.body;

    const updatedFood = await Food.findByIdAndUpdate(
      req.params.id,
      { name, price },
      { new: true, runValidators: true }
    );

    if (!updatedFood) {
      return res.status(404).json({ message: "Food not found" });
    }

    res.json(updatedFood);
  } catch (error) {
    res.status(400).json({ message: "Failed to update food", error: error.message });
  }
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  } catch (error) {
    console.error("Failed to connect MongoDB:", error.message);
    process.exit(1);
  }
};


// login store in mongodb 

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = mongoose.model("User", userSchema);


// register api

const bcrypt = require("bcryptjs");

app.post("/register", async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const user = new User({
    email: req.body.email,
    password: hashedPassword
  });

  await user.save();
  res.json({ message: "User registered" });
});


// login api
const jwt = require("jsonwebtoken");

app.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return res.json({ message: "User not found" });

  const isMatch = await bcrypt.compare(req.body.password, user.password);

  if (!isMatch) return res.json({ message: "Wrong password" });

  const token = jwt.sign(
    { userId: user._id },
    "secretkey"
  );

  res.json({ token });
});

// middleware to verify token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, "secretkey");
    req.user = decoded;
    next();
  } catch {
    res.json({ message: "Invalid token" });
  }
};

// pretect api

app.get("/foods", authMiddleware, async (req, res) => {
  const foods = await Food.find();
  res.json(foods);
});

// for deployment

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running");
});


startServer();








// here in array we will store our food items, in real world we will use database to store data

// // Sample data (food items)
// let foods = [
//   { id: 1, name: "Pizza", price: 200 },
//   { id: 2, name: "Burger", price: 150 }
// ];

// // GET - get all food items
// app.get("/foods", (req, res) => {
//   res.json(foods);
// });

// // POST - add new food
// app.post("/foods", (req, res) => {
//   const newFood = {
//     id: foods.length + 1,
//     name: req.body.name,
//     price: req.body.price
//   };
//   foods.push(newFood);
//   res.json(newFood);
// });

// //EDIT - update food
// app.put("/foods/:id", (req, res) => {
//   const id = parseInt(req.params.id);

//   foods = foods.map(food =>
//     food.id === id
//       ? { ...food, name: req.body.name, price: req.body.price }
//       : food
//   );

//   res.json({ message: "Updated" });
// });

// // DELETE - remove food
// app.delete("/foods/:id", (req, res) => {
//   const id = parseInt(req.params.id);
//   foods = foods.filter(food => food.id !== id);
//   res.json({ message: "Deleted" });
// });
