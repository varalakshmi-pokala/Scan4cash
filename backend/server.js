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

/* ========= STATIC ========= */
app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ========= Upload Folder ========= */
const uploadPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

/* ========= Multer (ONLY ONCE) ========= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

/* ========= MongoDB ========= */
const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

/* ========= Schema ========= */
const Request = mongoose.model(
  "Request",
  new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    wasteType: String,   // ✅ NEW
    description: String,
    date: String,
    time: String,        // ✅ NEW
    location: String,
    image: String,
    status: { type: String, default: "Pending" }
  }, { timestamps: true })
); 
/* ========= Routes ========= */
const Contact = mongoose.model(
  "Contact",
  new mongoose.Schema({
    name: String,
    email: String,
    phone: String,   // 🔥 ADD THIS
    message: String
  }, { timestamps: true })
);
// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Submit Form
app.post("/add-request", upload.single("image"), async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    if (!req.file) {
      return res.status(400).json({ error: "Image missing" });
    }

    const newRequest = await Request.create({
  name: req.body.name,
  email: req.body.email,
  phone: req.body.phone,
  wasteType: req.body.wasteType,  // ✅
  description: req.body.description,
  date: req.body.date,
  time: req.body.time,            // ✅
  location: req.body.location,
  image: req.file.filename,
});
    console.log("✅ Saved:", newRequest);

    res.json({ success: true });

  } catch (error) {
    console.error("❌ ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get data
app.get("/requests", async (req, res) => {
  const data = await Request.find().sort({ createdAt: -1 });
  res.json(data);
});

/* ========= START ========= */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🔥 Server running on", PORT);
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/admin.html"));
});

app.delete("/delete/:id", async (req, res) => {
  await Request.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});
app.post("/contact", async (req, res) => {
  const data = await Contact.create(req.body);
  res.json(data);
});

