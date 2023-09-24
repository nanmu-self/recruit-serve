const Router = require("koa-router");
const router = new Router();
const Joi = require("joi");
const { validateToken } = require("../../middlewares/auth");
// 定义 Joi 验证规则
const validationSchema = Joi.object({
  username: Joi.string().required().min(3).messages({
    "any.required": "用户名是必填字段。",
    "string.min": "用户名长度必须至少为 {#limit} 个字符。",
  }),
  password: Joi.string().required(),
});

router.get("/v1/book/latest", validateToken, async (ctx, next) => {
  // 获取请求体中的参数
  const { body } = ctx.request;
  // 使用 Joi 进行参数验证
  // const { error, value } = validationSchema.validate(body);
  // if (error) {
  //   const errorObj = new ParameterException(error.details[0].message, 10001);
  //   throw errorObj;
  // }
  console.log(ctx.auth.uid);
  ctx.body = {
    uid: ctx.auth.uid,
    scope: ctx.auth.scope,
  };
});

module.exports = router;
