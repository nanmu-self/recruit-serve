"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Users",
      [
        {
          nickname: "楠木",
          password: "$10$rOzfJmf9nnfOu1GYcPwUBurIzVePvZUda.9MOPQ0N/r9yzBN1/SWi",
          email: "157884200@qq.com",
          openid: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("People", null, {});
  },
};
