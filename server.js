require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors()); // ✅ Fixes CORS issues

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // ✅ Ensure this is set

// ✅ Test GET route to check if the server is running
app.get("/", (req, res) => {
    res.send("Chatbot API is running!");
});

// ✅ Ensure the /chat route is correctly set up
app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{ role: "user", parts: [{ text: message }] }]
            }
        );

        res.json({ reply: response.data.candidates[0].content.parts[0].text });

    } catch (error) {
        console.error("🔴 ERROR FROM GEMINI API:", error.response?.data || error.message);
        res.status(500).json({ error: "Something went wrong!", details: error.response?.data || error.message });
    }
});

// ✅ Ensure the correct PORT is used
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
