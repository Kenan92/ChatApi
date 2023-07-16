"use strict";
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [3, 25],
          msg:
            "name must be longer than 3 characters and less than 25 characters",
        },
      },
    },
    username: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: {
          msg: "This email address is not valid",
        },
      },
    },
    phone: DataTypes.STRING,
    password: DataTypes.STRING,
    image: DataTypes.STRING,
    thumbImage: DataTypes.STRING,
    active: DataTypes.INTEGER,
    activated: DataTypes.INTEGER,
    facebookID: DataTypes.STRING,
    googleID: DataTypes.STRING,
    firebaseToken: DataTypes.STRING,
  });
  User.associate = function (models) {
    User.hasMany(models.Conversation, {
      as: "conversations",
      foreignKey: "senderID",
      sourceKey: "id",
    });
    User.hasOne(models.Conversation, {
      as: "receiver",
      foreignKey: "receiverUsername",
      sourceKey: "username",
    });
  };

  return User;
};
