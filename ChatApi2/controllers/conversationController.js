const db = require("../models/index");
const User = db.User;
const Blocks = db.Blocks;
const Messages = db.Messages;
const Conversation = db.Conversation;
const catchAsync = require("./../utils/catchAsync");
const Resize = require("../utils/resize");
const path = require("path");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const { QueryTypes } = require("sequelize");
const sequelize = new Sequelize("chat_app2", "root", "", {
  host: "localhost",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});
exports.findOrCreateConversation = catchAsync(async (req, res, next) => {
  // Validate request
  if (!req.body.senderID || !req.body.receiverUsername) {
    res.status(400).send({
      status: false,
      message: "Required fields content can not be empty!",
    });
    return;
  }

  const oldConversation = await Conversation.findOne({
    where: {
      senderID: req.body.senderID,
      receiverUsername: req.body.receiverUsername,
    },
  });

  if (oldConversation) {
    res.status(200).send({
      status: true,
      isOld: true,
      data: oldConversation,
      message: "here is your conversation",
    });
    return;
  }

  if (req.file) {
    const imagePath = path.join(__dirname, "./../public/images");
    const fileUpload = new Resize(imagePath, 600, 600);
    const imageName = await fileUpload.save(req.file.buffer);
    const fileUpload2 = new Resize(imagePath, 100, 100);
    const thumbImageName = await fileUpload2.save(req.file.buffer);

    const newConversation = await Conversation.create({
      nickName: req.body.nickName ? req.body.nickName : "unknown",
      receiverUsername: req.body.receiverUsername,
      image: imageName,
      thumbImage: thumbImageName,
      senderID: req.body.senderID,
    });
    res.status(200).send({
      status: true,
      isOld: false,
      data: newConversation,
      message: "here is your conversation",
    });
  } else {
    const newConversation = await Conversation.create({
      nickName: req.body.nickName ? req.body.nickName : "unknown",
      receiverUsername: req.body.receiverUsername,
      senderID: req.body.senderID,
    });
    res.status(200).send({
      status: true,
      isOld: false,
      data: newConversation,
      message: "here is your conversation",
    });
  }
});
exports.updateNickname = catchAsync(async (req, res, next) => {
  // Validate request
  if ((!req.body.nickName, !req.body.conversationId)) {
    res.status(400).send({
      status: false,
      message: "please provide the nickname and id!",
    });
    return;
  }

  const newConversation = await Conversation.update(
    { nickName: req.body.nickName },
    { where: { id: req.body.conversationId } }
  );
  if (newConversation[0] !== 0)
    res.status(200).send({
      status: true,
      message: "your nickName updated",
    });
  else
    res.status(404).send({
      status: false,
      message: "not found!",
    });
});
exports.deleteConversation = catchAsync(async (req, res, next) => {
  // Validate request
  if (!req.body.conversationId) {
    res.status(400).send({
      status: false,
      message: "please provide your conversationId!",
    });
    return;
  }

  const conversation = await Conversation.findOne({
    where: {
      id: req.body.conversationId,
    },
  });
  if (!conversation) {
    res.status(404).send({
      status: false,
      message: "Conversation not exists!",
    });
    return;
  }
  await Conversation.destroy({
    where: { id: req.body.conversationId },
  });

  res.status(200).send({
    status: true,
    message: "the delete operation success",
  });
});
exports.getMyConversations = catchAsync(async (req, res, next) => {
  // Validate request
  if (!req.body.id || !req.body.username) {
    res.status(400).send({
      status: false,
      message: "please provide your ID and username!",
    });
    return;
  }
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const offset = (page - 1) * limit;

  const conversations = await sequelize.query(
    "select * from (SELECT `Conversation`.`id`, `Conversation`.`nickName`, `Conversation`.`senderID`, `Conversation`.`receiverUsername`, `Conversation`.`image`, `Conversation`.`thumbImage`, `Conversation`.`createdAt`, `Conversation`.`updatedAt`,`receiver`.`id` AS `receiver.id`, `receiver`.`name` AS `receiver.name`, `receiver`.`active` AS `receiver.active`, `receiver`.`image` AS `receiver.image`, `receiver`.`thumbImage` AS `receiver.thumbImage`, `receiver`.`updatedAt` AS `receiver.updatedAt`,( select  COUNT(`Message`.`seen`) from `Messages` as `Message` WHERE  `Message`.`conversationID` =`Conversation`.`id` and `Message`.`seen`= 0 and `Message`.`senderID` <> " +
      req.body.id +
      " GROUP BY `Conversation`.`id` ) AS `lastMessage.newMessages`,( select  `Message`.`message` from `Messages` as `Message` WHERE  `Message`.`conversationID` =`Conversation`.`id` ORDER BY createdAt DESC LIMIT 1) AS `lastMessage.message`,( select  `Message`.`id` from `Messages` as `Message` WHERE  `Message`.`conversationID` =`Conversation`.`id` ORDER BY createdAt DESC LIMIT 1) AS `lastMessage.id`,( select  `Message`.`createdAt` from `Messages` as `Message` WHERE  `Message`.`conversationID` =`Conversation`.`id` ORDER BY createdAt DESC LIMIT 1) AS `lastMessage.createdAt`,( select  `Message`.`seen` from `Messages` as `Message` WHERE  `Message`.`conversationID` =`Conversation`.`id` ORDER BY createdAt DESC LIMIT 1) AS `lastMessage.seen`,( select  `Message`.`senderID` from `Messages` as `Message` WHERE  `Message`.`conversationID` =`Conversation`.`id` ORDER BY createdAt DESC LIMIT 1) AS `lastMessage.senderID`  FROM `Conversations` AS `Conversation`, `Users` AS `receiver` WHERE `Conversation`.`senderID` = " +
      req.body.id +
      " AND `Conversation`.`receiverUsername` = `receiver`.`username` GROUP BY `Conversation`.`id` ORDER BY `lastMessage.createdAt` DESC) as t2  UNION DISTINCT SELECT * from ( select  * from ( SELECT DISTINCT `Conversation`.`id`, `Conversation`.`nickName`, `Conversation`.`senderID`, `Conversation`.`receiverUsername`, `Conversation`.`image`, `Conversation`.`thumbImage`, `Conversation`.`createdAt`, `Conversation`.`updatedAt`,`receiver`.`id` AS `receiver.id`, `receiver`.`name` AS `receiver.name`, `receiver`.`active` AS `receiver.active`, `receiver`.`image` AS `receiver.image`,`receiver`.`thumbImage` AS `receiver.thumbImage`, `receiver`.`updatedAt` AS `receiver.updatedAt`, null AS `lastMessage.newMessages` , null AS `lastMessage.message` , null AS `lastMessage.id`, null AS `lastMessage.createdAt` , null AS `lastMessage.seen`, null AS `lastMessage.senderID` FROM `Conversations` AS `Conversation`,`Users` AS `receiver` WHERE `Conversation`.`senderID` = " +
      req.body.id +
      " AND `Conversation`.`receiverUsername` = `receiver`.`username` and `Conversation`.`id` not in (select `conversationID` from `Messages`) ORDER BY `Conversation`.`createdAt`) as t1) as qry",
    { type: QueryTypes.SELECT }
  );

  //console.log(conversations);
  if (conversations.length == 0) {
    res.status(404).send({
      status: false,
      message: "there is no conversation!",
    });
  } else {
    const BlockedMe = await Blocks.findAll({
      where: {
        blockedUsername: req.body.username,
        blockedUserID: req.body.id,
      },
    });
    res.status(200).send({
      status: true,
      data: conversations,
      blockList: BlockedMe.length != 0 ? BlockedMe : null,
      message: "here are your conversations",
    });
  }
});
exports.getMyForeignConversations = catchAsync(async (req, res, next) => {
  // Validate request
  if (!req.body.username || !req.body.id) {
    res.status(400).send({
      status: false,
      message: "please provide your username and id!",
    });
    return;
  }
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const offset = (page - 1) * limit;

  const conversations = await sequelize.query(
    "select * from (SELECT `Conversation`.`id`, `Conversation`.`nickName`, `Conversation`.`senderID`, `receiver`.`username` as `receiverUsername`, `Conversation`.`image`, `Conversation`.`thumbImage`, `Conversation`.`createdAt`, `Conversation`.`updatedAt`,`receiver`.`id` AS `receiver.id`, `receiver`.`name` AS `receiver.name`, `receiver`.`active` AS `receiver.active`, `receiver`.`image` AS `receiver.image`, `receiver`.`thumbImage` AS `receiver.thumbImage`, `receiver`.`updatedAt` AS `receiver.updatedAt`,( select  COUNT(`Message`.`seen`) from `Messages` as `Message` WHERE  `Message`.`conversationID` =`Conversation`.`id` and `Message`.`seen`= 0 and `Message`.`senderID` <> " +
      req.body.id +
      ' GROUP BY `Conversation`.`id` ) AS `lastMessage.newMessages`,( select  `Message`.`message` from `Messages` as `Message` WHERE  `Message`.`conversationID` =`Conversation`.`id` ORDER BY createdAt DESC LIMIT 1) AS `lastMessage.message`,( select  `Message`.`id` from `Messages` as `Message` WHERE  `Message`.`conversationID` =`Conversation`.`id` ORDER BY createdAt DESC LIMIT 1) AS `lastMessage.id`,( select  `Message`.`createdAt` from `Messages` as `Message` WHERE  `Message`.`conversationID` =`Conversation`.`id` ORDER BY createdAt DESC LIMIT 1) AS `lastMessage.createdAt`,( select  `Message`.`seen` from `Messages` as `Message` WHERE  `Message`.`conversationID` =`Conversation`.`id` ORDER BY createdAt DESC LIMIT 1) AS `lastMessage.seen`,( select  `Message`.`senderID` from `Messages` as `Message` WHERE  `Message`.`conversationID` =`Conversation`.`id` ORDER BY createdAt DESC LIMIT 1) AS `lastMessage.senderID`  FROM `Conversations` AS `Conversation`, `Users` AS `receiver` WHERE `Conversation`.`receiverUsername` = "' +
      req.body.username +
      '" AND `Conversation`.`senderID` = `receiver`.`id` GROUP BY `Conversation`.`id` ORDER BY `lastMessage.createdAt` DESC) as t2',
    { type: QueryTypes.SELECT }
  );
  if (conversations.length == 0) {
    res.status(404).send({
      status: false,
      message: "there is no foreign conversation!",
    });
  } else {
    const BlockedUsers = await Blocks.findAll({
      where: {
        username: req.body.username,
        userID: req.body.id,
      },
    });
    res.status(200).send({
      status: true,
      data: conversations,
      blockList: BlockedUsers.length != 0 ? BlockedUsers : null,
      message: "here are your foreign conversations",
    });
  }
});
exports.getConversationMessages = catchAsync(async (req, res, next) => {
  // Validate request
  if (!req.body.conversationId || !req.body.id) {
    res.status(400).send({
      status: false,
      message: "please provide your id and conversationId!",
    });
    return;
  }
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 0;
  const offset = (page - 1) * limit;
  await Messages.update(
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
  const conversation = await Conversation.findOne({
    where: { id: req.body.conversationId },

    include: [
      {
        model: Messages,
        order: [["createdAt", "DESC"]],
        offset: offset,
        limit: limit,
      },
    ],
  });
  if (!conversation) {
    res.status(404).send({
      status: false,
      message: "There conversation is not exists!",
    });
    return;
  }
  if (conversation.Messages.length == 0) {
    res.status(404).send({
      status: false,
      message: "There is no messages!",
    });
    return;
  }
  res.status(200).send({
    status: true,
    data: conversation,
    page: page,
    limit: limit,
    message: "Here are your conversation messages",
  });
});
exports.updateImage = catchAsync(async (req, res, next) => {
  if (!req.file || !req.body.conversationId) {
    res.status(400).send({
      status: false,
      message: "please provide the image file and id!",
    });
    return;
  }

  const imagePath = path.join(__dirname, "./../public/images");
  const fileUpload = new Resize(imagePath, 600, 600);
  const imageName = await fileUpload.save(req.file.buffer);
  const fileUpload2 = new Resize(imagePath, 100, 100);
  const thumbImageName = await fileUpload2.save(req.file.buffer);

  const newConversation = await Conversation.update(
    { image: imageName, thumbImage: thumbImageName },
    { where: { id: req.body.conversationId } }
  );
  if (newConversation[0] !== 0)
    res.status(200).send({
      status: true,
      message: "your image updated",
    });
  else
    res.status(404).send({
      status: false,
      message: "not found!",
    });
});
