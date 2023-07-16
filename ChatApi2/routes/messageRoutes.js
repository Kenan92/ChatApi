const express = require("express");
const authController = require("./../controllers/authController");
const messageController = require("./../controllers/messageController");
const router = express.Router();

router.post(
  "/createNewMessage",
  authController.protect,
  messageController.createNewMessage
);
router.post(
  "/deleteMessage",
  authController.protect,
  messageController.deleteMessage
);
router.post(
  "/seeMessages",
  authController.protect,
  messageController.seeMessages
);
module.exports = router;
