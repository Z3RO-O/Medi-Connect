import express from "express"
import cors from 'cors'
import 'dotenv/config'
import connectDB from "./config/mongodb.js"
import connectCloudinary from "./config/cloudinary.js"
import userRouter from "./routes/userRoute.js"
import doctorRouter from "./routes/doctorRoute.js"
import adminRouter from "./routes/adminRoute.js"

// app config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// middlewares
app.use(express.json())
app.use(cors())

let latestRealVitals = null;
let lastUpdatedTime = Date.now();

// Toggle mock data on/off
const MOCK_ENABLED = false; // set to true to enable mock data

// Generate realistic looking vital signs
const generateRealisticVitals = () => {
  // if real vitals exist and are recent, return them
  if (latestRealVitals && (Date.now() - lastUpdatedTime < 30000)) {
    return latestRealVitals;
  }
  // otherwise generate mock
  const baseHeartRate = 72;
  const baseSpo2 = 98;
  const heartRateVariation = Math.floor(Math.random() * 8) - 3;
  const spo2Variation = Math.floor(Math.random() * 3) - 1;
  return {
    bpm: Math.max(60, Math.min(100, baseHeartRate + heartRateVariation)).toString(),
    spo2: Math.max(95, Math.min(100, baseSpo2 + spo2Variation)).toString(),
    timestamp: Date.now()
  };
};

// api endpoints
app.use("/api/user", userRouter)
app.use("/api/admin", adminRouter)
app.use("/api/doctor", doctorRouter)

app.get("/", (req, res) => {
  res.send("API Working")
});

// Receive vitals
app.post('/data', (req, res) => {
  try {
    const { bpm, spo2 } = req.body;
    if (!bpm || !spo2) {
      throw new Error("Missing required fields: bpm and spo2");
    }
    spo2 = Math.max(0, Math.min(100, Number(spo2)));

    console.log(`📥 Data received - BPM: ${bpm}, SpO2: ${spo2}`);
    latestRealVitals = { bpm, spo2, timestamp: Date.now() };
    lastUpdatedTime = Date.now();
    res.status(200).json({ success: true, message: "Data received successfully" });
  } catch (error) {
    console.error("Error processing vitals data:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Endpoint to get the latest vitals
app.get('/api/vitals/latest', (req, res) => {
  let vitals;
  if (MOCK_ENABLED) {
    vitals = generateRealisticVitals();
  } else if (latestRealVitals) {
    vitals = latestRealVitals;
  } else {
    return res.status(404).json({ success: false, message: 'No vitals data available' });
  }
  res.json({ success: true, ...vitals });
});

app.listen(port, () => console.log(`Server started on PORT:${port}`))