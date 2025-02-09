require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());  // 🔹 Enable CORS to fix blocked requests

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Use Gemini API Key
let chatHistory = [];  // Store previous messages

app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;

        // Add the new user message to history
        chatHistory.push({ role: "user", parts: [{ text: message }] });

        // Keep only the last 5 messages to avoid long history
        if (chatHistory.length > 5) chatHistory.shift();

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: chatHistory  // Send entire conversation history
            }
        );

        const botReply = response.data.candidates[0].content.parts[0].text;
        
        // Add bot's reply to history
        chatHistory.push({ role: "model", parts: [{ text: botReply }] });

        res.json({ reply: botReply });

    } catch (error) {
        console.error("🔴 ERROR FROM GEMINI API:", error.response?.data || error.message);
        res.status(500).json({ error: "Something went wrong!", details: error.response?.data || error.message });
    }
});


app.listen(5000, () => console.log("🚀 Server running on port 5000"));
