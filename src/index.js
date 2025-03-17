import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
dotenv.config();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const FIXED_MESSAGE = "Xin chào Hoàng Em! Đây là tin nhắn tự động từ Fanpage. Bạn cần hỗ trợ gì không?";

app.get("/", (req, res) => {
  res.send("Home");
});


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

    res.status(200).json("EVENT_RECEIVE");
  } else {
    res.sendStatus(404);
  }
});

// Gửi tin nhắn phản hồi
async function sendMessage(senderId, text) {
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

  try {
    await axios.post(
      `https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        recipient: { id: senderId },
        message: { text: text },
      }
    );
  } catch (error) {
    console.error("Lỗi gửi tin nhắn:", error.response.data);
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// // Khởi động server
// export const viteNodeApp = app;
