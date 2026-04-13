const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

/* ========= Middlewares ========= */
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.use("/uploads", express.static("uploads"));

/* ========= Mongo ========= */
const MONGO_URL = process.env.MONGO_URL;

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

/* ========= Multer ========= */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/* ========= Schema ========= */
const Request = mongoose.model(
  "Request",
  new mongoose.Schema(
    {
      name: String,
      email: String,
      phone: String,
      description: String,
      date: String,
      location: String,
      image: String,
      status: { type: String, default: "Pending" },
    },
    { timestamps: true }
  )
);

/* ========= Routes ========= */

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Add request
app.post("/add-request", upload.single("image"), async (req, res) => {
  try {
    const data = await Request.create({
      ...req.body,
      image: req.file ? req.file.filename : "",
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all
app.get("/requests", async (req, res) => {
  try {
    const data = await Request.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
app.put("/update/:id", async (req, res) => {
  try {
    await Request.findByIdAndUpdate(req.params.id, {
      status: req.body.status,
    });

    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ========= Start ========= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🔥 Server running on", PORT);
});