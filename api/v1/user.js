const Router = require("koa-router");

const Joi = require("joi");
const { ParameterException, Success } = require("../../core/http-exception");
const { User } = require("../../models");
const router = new Router({
  prefix: "/v1/user", //域名前缀
});

// 定义 Joi 验证规则
const validationSchema = Joi.object({
  email: Joi.string().email().messages({
    "string.email": "邮箱格式不正确。",
  }),
  nickname: Joi.string().min(2).max(20).messages({
    "string.min": "昵称长度必须至少为 {#limit} 个字符。",
    "string.max": "昵称长度必须不超过 {#limit} 个字符。",
  }),
  password1: Joi.string()
    .required()
    .min(6)
    .max(20)
    .pattern(new RegExp("^[a-zA-Z0-9s]*$"))
    .messages({
      "string.min": "密码长度必须至少为 {#limit} 个字符。",
      "string.max": "密码长度必须不超过 {#limit} 个字符。",
      "string.pattern.base": "密码不能包含特殊符号。",
    }),
  password2: Joi.string()
    .valid(Joi.ref("password1")) // 使用 Joi.ref 引用密码字段的值
    .required()
    .strict() // 确保密码和确认密码完全相同
    .messages({
      "any.only": "两次输入的密码不一致",
    }),
});
//注册
router.post("/register", async (ctx) => {
  // 获取请求体中的参数
  const { body } = ctx.request;

  // 使用 Joi 进行参数验证
  const { error, value } = validationSchema.validate(body);
  if (error) {
    let errorObj = new ParameterException(error.details[0].message, 10001);
    throw errorObj;
  }

  //检查email是否存在
  let isemail = await User.findOne({
    where: {
      email: body.email,
    },
  });
  if (isemail) {
    let errorObj = new ParameterException("该邮箱已被注册", 10001);
    throw errorObj;
  }

  //插入数据
  const user = {
    email: body.email,
    nickname: body.nickname,
    password: body.password1,
  };
  await User.create(user);
  throw new Success("注册成功");
});

module.exports = router;
