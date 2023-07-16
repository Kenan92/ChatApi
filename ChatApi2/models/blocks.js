"use strict";
module.exports = (sequelize, DataTypes) => {
  const Blocks = sequelize.define(
    "Blocks",
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      blockedUsername: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      blockedUserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
    },
    {}
  );
  Blocks.associate = function (models) {
    // associations can be defined here
  };
  return Blocks;
};
