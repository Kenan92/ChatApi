const express = require("express");
const authController = require("./../controllers/authController");
const upload = require("./../middleware/uploadMiddleware");
const router = express.Router();

router.post(
  "/registerByEmail",
  upload.single("image"),
  authController.registerByEmail
);
router.post(
  "/registerByPhone",
  upload.single("image"),
  authController.registerByPhone
);
router.post("/loginWithEmail", authController.loginWithEmail);
router.post("/loginWithPhone", authController.loginWithPhone);
router.post(
  "/registerOrLoginByFacebook",
  authController.registerOrLoginByFacebook
);
router.post("/registerOrLoginByGmail", authController.registerOrLoginByGmail);
router.post(
  "/editProfile",
  authController.protect,
  upload.single("image"),
  authController.editProfile
);

router.post(
  "/activateProfile",
  authController.protect,
  authController.activateProfile
);
router.post(
  "/getUserProfile",
  authController.protect,
  authController.getUserProfile
);

router.post("/blockUser", authController.protect, authController.blockUser);
router.post("/unblockUser", authController.protect, authController.unblockUser);
router.post(
  "/getBlockedUsers",
  authController.protect,
  authController.getBlockedUsers
);
router.post(
  "/getBlockedMe",
  authController.protect,
  authController.getBlockedMe
);

module.exports = router;
