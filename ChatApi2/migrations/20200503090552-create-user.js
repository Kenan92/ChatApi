"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [3, 25],
            msg:
              "name must be longer than 3 characters and less than 25 characters",
          },
        },
      },
      username: {
        type: Sequelize.STRING,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        validate: {
          isEmail: {
            msg: "This email address is not valid",
          },
        },
      },
      phone: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
      },
      image: {
        type: Sequelize.STRING,
      },
      thumbImage: {
        type: Sequelize.STRING,
      },
      active: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      facebookID: {
        type: Sequelize.STRING,
      },
      googleID: {
        type: Sequelize.STRING,
      },
      firebaseToken: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Users");
  },
};
