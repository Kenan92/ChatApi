module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Conversations", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nickName: {
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
      senderID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "cascade",
      },
      receiverUsername: {
        type: Sequelize.STRING,
        allowNull: false,
        references: { model: "users", key: "username" },
        onDelete: "cascade",
      },
      image: {
        type: Sequelize.STRING,
      },
      thumbImage: {
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
    return queryInterface.dropTable("Conversations");
  },
};
