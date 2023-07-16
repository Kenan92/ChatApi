"use strict";
module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define(
    "Conversation",
    {
      nickName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      senderID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      receiverUsername: {
        type: DataTypes.STRING,
        allowNull: false,
        references: { model: "users", key: "username" },
      },
      image: DataTypes.STRING,
      thumbImage: DataTypes.STRING,
    },
    {}
  );
  Conversation.associate = function (models) {
    Conversation.belongsTo(models.User, {
      as: "sender",
      foreignKey: "senderID",
      targetKey: "id",
    });
    Conversation.hasMany(models.Messages, {
      foreignKey: "conversationID",
      sourceKey: "id",
    });
    Conversation.belongsTo(models.User, {
      as: "receiver",
      foreignKey: "receiverUsername",
      targetKey: "username",
    });
  };
  return Conversation;
};
