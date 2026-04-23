require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI environment variable");
  process.exit(1);
}

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

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const Food = mongoose.model("Food", foodSchema);
const User = mongoose.model("User", userSchema);

app.use(cors());
app.use(express.json());

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword
    });

    await user.save();
    res.status(201).json({ message: "User registered" });
  } catch (error) {
    res.status(500).json({ message: "Register failed", error: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

app.get("/foods", authMiddleware, async (req, res) => {
  try {
    const foods = await Food.find().sort({ createdAt: -1 });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch foods", error: error.message });
  }
});

app.post("/foods", authMiddleware, async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: "Name and price are required" });
    }

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

app.put("/foods/:id", authMiddleware, async (req, res) => {
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

app.delete("/foods/:id", authMiddleware, async (req, res) => {
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

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect MongoDB:", error.message);
    process.exit(1);
  }
};

startServer();
