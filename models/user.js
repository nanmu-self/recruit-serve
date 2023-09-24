"use strict";
const bcrypt = require("bcryptjs");
const { Model } = require("sequelize");
const { AuthFailed, NotFound } = require("../core/http-exception");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static async login(email, password) {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new NotFound("用户不存在");
      }
      if (!bcrypt.compareSync(password, user.password)) {
        throw new AuthFailed("密码错误");
      }
      return user;
    }
    // 查询是否存在 opendid 的小程序用户
    static async getUserByOpenid(openid) {
      return await User.findOne({ where: { openid } });
    }

    // 注册小程用户
    static async createUserByOpenid(openid) {
      // 查询用户
      const user = await User.create({
        openid,
      });

      return user;
    }
  }
  User.init(
    {
      nickname: DataTypes.STRING,
      password: {
        type: DataTypes.STRING,
        set(value) {
          //   密码加密
          let salt = bcrypt.genSaltSync(10);
          let psw = bcrypt.hashSync(value, salt);
          this.setDataValue("password", psw);
        },
      },
      email: DataTypes.STRING,
      openid: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
