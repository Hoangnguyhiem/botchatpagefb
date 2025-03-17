require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const FIXED_MESSAGE = "Xin chào! Đây là tin nhắn tự động từ Fanpage. Bạn cần hỗ trợ gì không?";

// Xác thực Webhook với Facebook
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  if (req.query["hub.mode"] === "subscribe" && req.query["hub.verify_token"] === VERIFY_TOKEN) {
    console.log("Webhook verified!");
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    res.sendStatus(403);
  }
});

// Xử lý tin nhắn từ người dùng
app.post("/webhook", async (req, res) => {
  const body = req.body;
  console.log(body)

  if (body.object === "page") {
    body.entry.forEach((entry) => {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      // Luôn trả lời tin nhắn cố định
      sendMessage(senderId, FIXED_MESSAGE);
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// Gửi tin nhắn phản hồi
async function sendMessage(senderId, text) {
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

  try {
    await axios.post(
      `https://graph.facebook.com/v12.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        recipient: { id: senderId },
        message: { text: text },
      }
    );
  } catch (error) {
    console.error("Lỗi gửi tin nhắn:", error.response.data);
  }
}

// Khởi động server
app.listen(PORT, () => {
  console.log(`Bot đang chạy trên cổng ${PORT}`);
});
