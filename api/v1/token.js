const Router = require("koa-router");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const Joi = require("joi");
const { ParameterException, AuthFailed } = require("../../core/http-exception");
const { User } = require("../../models");

const router = new Router({
  prefix: "/v1/token", //域名前缀
});
const validationSchema = Joi.object({
  account: Joi.string().required().min(4).max(32).messages({
    "string.min": "账号格式不正确",
    "string.max": "账号格式不正确",
  }),
  secret: Joi.string().min(6).max(20).messages({
    "string.min": "密码为6-20位",
    "string.max": "密码为6-20位",
  }),
  type: Joi.number().required().valid(1, 2).messages({
    "any.only": "类型只能为1或2",
  }),
});

router.post("/", async (ctx) => {
  const { body } = ctx.request;
  const { error, value } = validationSchema.validate(body);
  if (error) {
    throw new ParameterException(error.details[0].message);
  }
  console.log(body);
  let token = null;
  //1为邮箱登录，2为微信小程序登录
  switch (parseInt(body.type)) {
    case 1:
      token = await emailLogin(body.account, body.secret);
      break;
    case 2:
      token = await codeToToken(body.account);
      break;

    default:
      throw new ParameterException("没有相应的处理函数");
      break;
  }

  ctx.body = {
    token,
  };
});

const emailLogin = async (account, secret) => {
  let user = await User.login(account, secret);
  return jwt.sign(
    {
      uid: user.id,
      scope: 2,
    },
    process.env.Secret_Key,
    {
      expiresIn: process.env.Expires_In,
    }
  );
};

const codeToToken = async (code) => {
  let res = await axios.get(
    `https://api.weixin.qq.com/sns/jscode2session?appid=${process.env.Wx_AppId}&secret=${process.env.Wx_AppSecret}&js_code=${code}&grant_type=authorization_code`
  );
  if (res.status !== 200) {
    throw new AuthFailed("微信登录失败");
  }
  if (res.data.errcode) {
    throw new AuthFailed("微信登录失败:" + res.data.errcode);
  }

  let user = await User.getUserByOpenid(res.data.openid);
  if (!user) {
    user = await User.createUserByOpenid(res.data.openid);
  }
  return jwt.sign(
    {
      uid: user.id,
      scope: 2,
    },
    process.env.Secret_Key,
    {
      expiresIn: process.env.Expires_In,
    }
  );
};

module.exports = router;
