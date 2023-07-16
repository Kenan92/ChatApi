const db = require("../models/index");
const User = db.User;
const Conversation = db.Conversation;
const Messages = db.Messages;
const catchAsync = require("./../utils/catchAsync");
const { Op } = require("sequelize");

exports.createNewMessage = catchAsync(async (req, res, next) => {
  // Validate request
  if (!req.body.senderID || !req.body.message || !req.body.conversationID) {
    res.status(400).send({
      status: false,
      message: "Required fields content can not be empty!",
    });
    return;
  }

  const user = await User.findOne({
    where: {
      id: req.body.senderID,
    },
  });
  if (!user) {
    res.status(404).send({
      status: false,
      message: "Not found your data!",
    });
    return;
  }
  const conversation = await Conversation.findOne({
    where: { id: req.body.conversationID },
  });
  if (!conversation) {
    res.status(404).send({
      status: false,
      message: "Not found this conversation",
    });
    return;
  } else {
    if (
      conversation.receiverUsername !== user.username &&
      conversation.senderID !== user.id
    ) {
      res.status(404).send({
        status: false,
        message: "This conversation does not belong to you!",
      });
      return;
    }
    
    const newMessage = await Messages.create({
      senderID: req.body.senderID,
      message: req.body.message,
      conversationID: req.body.conversationID,
    });
    res.status(200).send({
      status: true,
      data: newMessage,
      message: "Message sent successfully",
    });
  }
});
exports.deleteMessage = catchAsync(async (req, res, next) => {
  // Validate request
  if (!req.body.messageId) {
    res.status(400).send({
      status: false,
      message: "please provide your messageId!",
    });
    return;
  }
  const message = await Messages.findOne({
    where: {
      id: req.body.messageId,
    },
  });
  if (!message) {
    res.status(404).send({
      status: false,
      message: "Message not exists!",
    });
    return;
  }
  await Messages.destroy({
    where: { id: req.body.messageId },
  });

  res.status(200).send({
    status: true,
    message: "The delete operation success",
  });
});
exports.seeMessages = catchAsync(async (req, res, next) => {
  // Validate request
  if ((!req.body.id, !req.body.conversationId)) {
    res.status(400).send({
      status: false,
      message: "please provide the user id and conversationId!",
    });
    return;
  }

  const conversation = await Conversation.findOne({
    where: { id: req.body.conversationId },
  });
  if (!conversation) {
    res.status(404).send({
      status: false,
      message: "conversation not found!",
    });
    return;
  }
  const newMessages = await Messages.update(
    {
      seen: 1,
    },
    {
      where: {
        senderID: { [Op.ne]: req.body.id },
        conversationId: req.body.conversationId,
        seen: 0,
      },
    }
  );
  if (newMessages[0] !== 0)
    res.status(200).send({
      status: true,
      message: "Your messages set as seen",
    });
  else
    res.status(404).send({
      status: false,
      message: "operation failed",
    });
});
