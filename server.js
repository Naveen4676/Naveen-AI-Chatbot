require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const compression = require("compression");

const app = express();
app.use(express.json());
app.use(cors());
app.use(compression()); // ✅ Compress responses to speed up data transfer

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("❌ ERROR: GEMINI_API_KEY is missing! Set it in your .env file.");
    process.exit(1);
}

// ✅ Test route to check if the server is running
app.get("/", (req, res) => {
    res.send("🚀 Chatbot API is running fast!");
});

// ✅ Route to list available models (for debugging)
app.get("/models", async (req, res) => {
    try {
        const response = await axios.get(
            `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`
        );
        res.json(response.data);
    } catch (error) {
        console.error("🔴 ERROR FETCHING MODELS:", error.response?.data || error.message);
        res.status(500).json({ error: "❌ Unable to fetch models!", details: error.response?.data || error.message });
    }
});

// ✅ Chatbot Route (Optimized for Speed)
app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: "❌ Message is required!" });
        }

        // ✅ Set up Axios with Keep-Alive for faster requests
        const axiosInstance = axios.create({
            timeout: 5000, // ✅ Set request timeout to 5 seconds
            headers: { "Connection": "keep-alive" } // ✅ Reuse connection for speed
        });

        // ✅ Send request to Gemini API (Ensuring correct model name)
        const response = await axiosInstance.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{ role: "user", parts: [{ text: message }] }]
            }
        );

        // ✅ Extract response fast
        const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "🤖 No response received.";

        res.json({ reply });

    } catch (error) {
        console.error("🔴 ERROR FROM GEMINI API:", error.response?.data || error.message);
        res.status(500).json({
            error: "❌ Something went wrong!",
            details: error.response?.data || error.message
        });
    }
});
app.get("/api", (req, res) => {
    res.json({ message: "Hello from the backend!" });
  });
  

// ✅ Optimize Server for High Performance
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Fast Server running on port ${PORT}`));
