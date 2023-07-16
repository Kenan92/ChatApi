const express = require("express");
const authController = require("./../controllers/authController");
const conversationController = require("./../controllers/conversationController");
const router = express.Router();
const upload = require("./../middleware/uploadMiddleware");

router.post(
  "/findOrCreateConversation",
  authController.protect,
  upload.single("image"),
  conversationController.findOrCreateConversation
);
router.post(
  "/getMyConversations",
  authController.protect,
  conversationController.getMyConversations
);
router.post(
  "/getMyForeignConversations",
  authController.protect,
  conversationController.getMyForeignConversations
);
router.post(
  "/getConversationMessages",
  authController.protect,
  conversationController.getConversationMessages
);

router.post(
  "/deleteConversation",
  authController.protect,
  conversationController.deleteConversation
);
router.post(
  "/updateNickname",
  authController.protect,
  conversationController.updateNickname
);
router.post(
  "/updateImage",
  authController.protect,
  upload.single("image"),
  conversationController.updateImage
);

module.exports = router;
