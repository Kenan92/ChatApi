const { QueryTypes } = require("sequelize");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
let FCM = require("fcm-node");

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
const { userJoin, getCurrentUser, userLeave } = require("./../utils/users");

const db = require("../models/index");
const UserModel = db.User;
const Messages = db.Messages;
const Conversation = db.Conversation;

module.exports = function (io) {
  io.sockets.on("connection", function (socket) {
    console.log(socket.id);

    socket.on("activeMe", async (data) => {
      await UserModel.update({ active: 1 }, { where: { id: data.id } });
      userJoin(socket.id, data.id, "0");
      const myFriends = await sequelize.query(
        "SELECT DISTINCT Conversations.receiverUsername as username from Conversations where Conversations.senderID = " +
          data.id,
        { type: QueryTypes.SELECT }
      );

      for (let friend of myFriends) {
        console.log(friend);
        socket.to(friend.username).emit("active", data.id);
      }

      const myFriends2 = await sequelize.query(
        'SELECT DISTINCT Users.username as username from Users,Conversations where Conversations.senderID=Users.id and Conversations.receiverUsername = "' +
          data.username +
          '"',
        { type: QueryTypes.SELECT }
      );

      for (let friend of myFriends2) {
        socket.to(friend.username).emit("active", data.id);
      }
      socket.join(data.username);
      socket.emit("activated", "you are online");
    });

    socket.on("createConversation", (data) => {
      socket.to(data.friendUsername).emit("conversation", data);

      io.to(data.receiverUsername).emit("conversation", data);
    });

    socket.on("joinConversation", (data) => {
      console.log("ssssssssss" + data.conversationId);
      console.log("ssssssssss" + data.id);

      const oldRoom = getCurrentUser(socket.id);
      if (oldRoom.room !== `${data.conversationId}`) {
        socket.leave(oldRoom.room);
        const user = userJoin(socket.id, data.id, `${data.conversationId}`);
        socket.join(user.room);
      }
    });

    socket.on("chatMessage", async (data) => {
      const user = getCurrentUser(socket.id);
      const newMessage = await Messages.create({
        senderID: data.senderID,
        message: `${data.message}`,
        conversationID: data.conversationID,
      });

      io.to(user.room).emit("message", newMessage);
      io.to(data.receiverUserName).emit("chat", newMessage);

      const myAccount = await UserModel.findOne({
        where: {
          id: data.senderID,
        },
      });
      const friendAccount = await UserModel.findOne({
        where: {
          username: data.receiverUserName,
        },
      });

      const freshConversation = await Conversation.findOne({
        where: {
          id: data.conversationID,
        },
      });

      const serverKey =
        "AAAAiZuK8AY:APA91bFCeOyZxbpCY6sl4PuKZgXYEBrQehZkdYfpLGp_356ubJTHZJCLTXb6J5ATTcaAiEX15SyBnDHfJDcOBgb31tn32BPmVW6-LkNchWOnwYxiS4yRDO_nuT-Hmv0w5NOzJPYZZ-Xb";

      let title = "new message";
      let isReceiver = "no";
      let thumbImage = "logo.png";
      if (`${freshConversation.senderID}` == `${data.senderID}`) {
        title = freshConversation.nickName;
        isReceiver = "yes";
        if (freshConversation.thumbImage)
          thumbImage = freshConversation.thumbImage;
      } else {
        title = myAccount.name;
        thumbImage = myAccount.thumbImage;
      }

      /*    FCM.FCM(serverKey, friendAccount.firebaseToken , title, message);
            console.log("firebaseToken"+friendAccount.firebaseToken);
           */

      const fcm = new FCM(serverKey);

      const message = {
        to: friendAccount.firebaseToken,
        collapse_key: "ehky",

        notification: {
          title: title,
          body: `${data.message}`,
          click_action: "NOTE",
        },

        data: {
          title: title,
          recieverID: myAccount.id,
          updatedAt: myAccount.updatedAt,
          active: "0",
          thumbImage: thumbImage,
          conversationID: data.conversationID,
          receiverUserName: myAccount.username,
          isReceiver: isReceiver,
          myID: friendAccount.id,
        },

        priority: "high",
      };
      fcm.send(message, function (err, response) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully sent with response: ", response);
        }
      });
    });
    socket.on("seeMessage", async (data) => {
      const user = getCurrentUser(socket.id);
      await Messages.update(
        {
          seen: 1,
        },
        {
          where: {
            senderID: { [Op.ne]: data.id },
            conversationId: data.conversationID,
            seen: 0,
          },
        }
      );

      socket.to(user.room).emit("seen", data.conversationID);
      socket
        .to(data.receiverUserName)
        .emit("seenConversation", data.conversationID);
    });

    socket.on("blockUser", async (data) => {
      const user = getCurrentUser(socket.id);
      socket.to(user.room).emit("block");
      socket.to(data.blockedUsername).emit("blockConversation", data);
    });

    socket.on("unblockUser", async (data) => {
      const user = getCurrentUser(socket.id);
      socket.to(user.room).emit("unblock");
      socket.to(data.blockedUsername).emit("unblockConversation", data);
    });

    socket.on("deleteConversation", async (data) => {
      const user = getCurrentUser(socket.id);
      await Conversation.destroy({
        where: {
          id: data.conversationID,
        },
      });
      socket.to(user.room).emit("delete", data.conversationID);
      socket.to(data.receiverUserName).emit("deleteC", data.conversationID);
    });

    socket.on("typing", () => {
      const user = getCurrentUser(socket.id);
      socket.to(user.room).emit("typing");
    });

    socket.on("stopTyping", () => {
      const user = getCurrentUser(socket.id);
      socket.to(user.room).emit("stopTyping");
    });

    socket.on("disconnect", async () => {
      const user = getCurrentUser(socket.id);
      socket.to(user.room).emit("stopTyping");
      await UserModel.update({ active: 0 }, { where: { id: user.myID } });

      const myAccount = await sequelize.query(
        "SELECT id , username from Users where id = " + user.myID,
        { type: QueryTypes.SELECT }
      );

      const myFriends = await sequelize.query(
        "SELECT DISTINCT Conversations.receiverUsername as username from Conversations where Conversations.senderID = " +
          user.myID,
        { type: QueryTypes.SELECT }
      );
      for (let friend of myFriends) {
        socket.to(friend.username).emit("deactivate", user.myID);
      }
      const myFriends2 = await sequelize.query(
        'SELECT DISTINCT Users.username as username from Users,Conversations where Conversations.senderID=Users.id and Conversations.receiverUsername = "' +
          myAccount[0].username +
          '"',
        { type: QueryTypes.SELECT }
      );
      for (let friend of myFriends2) {
        socket.to(friend.username).emit("deactivate", user.myID);
      }
      userLeave(socket.id);
    });
  });
};
