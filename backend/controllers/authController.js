const Joi = require("joi");
const authService = require("../services/authService");
const { logModuleEvent } = require("../lib/moduleLogger");

const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(4).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

async function register(req, res) {
  const { error, value } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const payload = {
      name: value.name,
      email: String(value.email).trim().toLowerCase(),
      password: value.password,
    };
    const result = await authService.registerUser(payload);
    logModuleEvent("authentication", "register_ok", { email: payload.email });
    return res.status(201).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

async function login(req, res) {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const result = await authService.loginUser({
      email: String(value.email).trim().toLowerCase(),
      password: value.password,
    });
    logModuleEvent("authentication", "login_ok", {
      userId: result.user?.id,
      role: result.user?.role,
    });
    return res.json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

module.exports = {
  register,
  login,
};
