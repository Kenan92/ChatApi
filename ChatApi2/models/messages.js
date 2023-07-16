"use strict";
module.exports = (sequelize, DataTypes) => {
  const Messages = sequelize.define(
    "Messages",
    {
      message: DataTypes.STRING,
      senderID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "cascade",
      },
      conversationID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "conversations", key: "id" },
      },
      seen: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
    },
    {}
  );
  Messages.associate = function (models) {
    Messages.belongsTo(models.Conversation, {
      as: "messages",
      foreignKey: "conversationID",
      targetKey: "id",
    });
  };
  return Messages;
};
