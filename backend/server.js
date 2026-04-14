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

/* ========= STATIC FILES (VERY IMPORTANT FIX) ========= */
app.use(express.static(path.join(__dirname, "../public")));

/* ========= Upload Folder ========= */
const uploadPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

app.use("/uploads", express.static(uploadPath));

/* ========= MongoDB ========= */
const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

/* ========= Multer ========= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
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

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Add request
app.post("/add-request", upload.single("image"), async (req, res) => {
  try {
    const newRequest = await Request.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      description: req.body.description,
      date: req.body.date,
      location: req.body.location,
      image: req.file ? req.file.filename : "",
    });

    res.json({ success: true, data: newRequest });

  } catch (error) {
    console.error("❌ ERROR:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// Get all requests
app.get("/requests", async (req, res) => {
  try {
    const data = await Request.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Fetch error" });
  }
});

// Update status
app.put("/update/:id", async (req, res) => {
  try {
    await Request.findByIdAndUpdate(req.params.id, {
      status: req.body.status,
    });

    res.json({ message: "Updated" });

  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

/* ========= START SERVER ========= */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🔥 Server running on", PORT);
});