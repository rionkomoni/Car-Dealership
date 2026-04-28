const userService = require("../services/userService");
const { logModuleEvent, logModuleError } = require("../lib/moduleLogger");
const Joi = require("joi");
const { saveAuditLog, auditContextFromReq } = require("../services/auditService");

async function getMe(req, res) {
  try {
    logModuleEvent("users", "profile_read", { userId: req.user?.id });
    return res.json(userService.getProfileFromToken(req.user));
  } catch (err) {
    logModuleError("users", "profile_read", err);
    return res.status(500).json({ message: err.message });
  }
}

async function listAll(req, res) {
  try {
    logModuleEvent("users", "admin_list", { byUserId: req.user?.id });
    const users = await userService.listUsersForAdmin();
    return res.json(users);
  } catch (err) {
    logModuleError("users", "admin_list", err);
    return res.status(500).json({ message: err.message });
  }
}

async function getOne(req, res) {
  try {
    const id = Number(req.params.id);
    const u = await userService.getUserForAdmin(id);
    if (!u) return res.status(404).json({ message: "User not found" });
    return res.json(u);
  } catch (err) {
    logModuleError("users", "admin_get", err);
    return res.status(500).json({ message: err.message });
  }
}

async function create(req, res) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: Joi.string().min(6).max(200).required(),
    role: Joi.string().valid("client", "manager", "admin").default("client"),
    is_active: Joi.boolean().default(false),
  });
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const created = await userService.createUserAsAdmin({
      ...value,
      email: String(value.email).trim().toLowerCase(),
    });
    logModuleEvent("users", "admin_create", { byUserId: req.user?.id, userId: created.id });
    await saveAuditLog({
      module: "users",
      action: "create_user",
      outcome: "success",
      userId: req.user?.id,
      userEmail: req.user?.email,
      role: req.user?.role,
      targetType: "user",
      targetId: String(created.id),
      metadata: { email: created.email, role: created.role },
      ...auditContextFromReq(req),
    });
    return res.status(201).json(created);
  } catch (err) {
    logModuleError("users", "admin_create", err);
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Ky email ekziston" });
    }
    return res.status(500).json({ message: err.message });
  }
}

async function update(req, res) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email({ tlds: { allow: false } }).optional(),
    password: Joi.string().min(6).max(200).optional(),
    role: Joi.string().valid("client", "manager", "admin").optional(),
    is_active: Joi.boolean().optional(),
  });
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const id = Number(req.params.id);
    const ok = await userService.updateUserAsAdmin(id, {
      ...value,
      email: value.email ? String(value.email).trim().toLowerCase() : undefined,
    });
    if (!ok) return res.status(404).json({ message: "User not found" });
    logModuleEvent("users", "admin_update", { byUserId: req.user?.id, userId: id });
    await saveAuditLog({
      module: "users",
      action: "update_user",
      outcome: "success",
      userId: req.user?.id,
      userEmail: req.user?.email,
      role: req.user?.role,
      targetType: "user",
      targetId: String(id),
      ...auditContextFromReq(req),
    });
    return res.json({ message: "User updated" });
  } catch (err) {
    logModuleError("users", "admin_update", err);
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Ky email ekziston" });
    }
    return res.status(500).json({ message: err.message });
  }
}

async function remove(req, res) {
  try {
    const id = Number(req.params.id);
    const ok = await userService.deleteUserAsAdmin(id);
    if (!ok) return res.status(404).json({ message: "User not found" });
    logModuleEvent("users", "admin_delete", { byUserId: req.user?.id, userId: id });
    await saveAuditLog({
      module: "users",
      action: "delete_user",
      outcome: "success",
      userId: req.user?.id,
      userEmail: req.user?.email,
      role: req.user?.role,
      targetType: "user",
      targetId: String(id),
      ...auditContextFromReq(req),
    });
    return res.json({ message: "User deleted" });
  } catch (err) {
    logModuleError("users", "admin_delete", err);
    return res.status(500).json({ message: err.message });
  }
}

async function requestActivation(req, res) {
  const schema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
  });
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const { activationLink, delivered } = await userService.requestActivationForEmail(value.email);
    const response = {
      message: delivered
        ? "Nëse email ekziston, u dërgua linku i aktivizimit."
        : "Nëse email ekziston, linku i aktivizimit është gjeneruar.",
    };
    await saveAuditLog({
      module: "users",
      action: "request_activation",
      outcome: "success",
      targetType: "user_email",
      targetId: String(value.email).trim().toLowerCase(),
      ...auditContextFromReq(req),
    });
    // Keep optional debug visibility for local/dev without exposing links by default.
    if (String(process.env.EXPOSE_ACTIVATION_LINK || "false").toLowerCase() === "true") {
      response.activationLink = activationLink;
    }
    return res.json(response);
  } catch (err) {
    logModuleError("users", "activation_request", err);
    return res.status(500).json({ message: err.message });
  }
}

async function activate(req, res) {
  const token = String(req.query.token || "").trim();
  if (!token) return res.status(400).json({ message: "Token is required" });
  try {
    const r = await userService.activateAccountByToken(token);
    if (!r.ok) {
      const msg =
        r.reason === "used"
          ? "Token është përdorur"
          : r.reason === "expired"
            ? "Token është skaduar"
            : "Token i pavlefshëm";
      return res.status(400).json({ message: msg });
    }
    await saveAuditLog({
      module: "users",
      action: "activate_account",
      outcome: "success",
      ...auditContextFromReq(req),
    });
    return res.json({ message: "Llogaria u aktivizua me sukses" });
  } catch (err) {
    logModuleError("users", "activation_activate", err);
    return res.status(500).json({ message: err.message });
  }
}

async function changePassword(req, res) {
  const schema = Joi.object({
    current_password: Joi.string().required(),
    new_password: Joi.string().min(6).max(200).required(),
  });
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const r = await userService.changePasswordWithVerification(
      req.user.id,
      value.current_password,
      value.new_password
    );
    if (!r.ok) {
      if (r.reason === "current_invalid") {
        await saveAuditLog({
          module: "users",
          action: "change_password",
          outcome: "failure",
          message: "invalid_current_password",
          userId: req.user?.id,
          userEmail: req.user?.email,
          role: req.user?.role,
          ...auditContextFromReq(req),
        });
        return res.status(400).json({ message: "Password aktual është gabim" });
      }
      return res.status(404).json({ message: "User not found" });
    }
    await saveAuditLog({
      module: "users",
      action: "change_password",
      outcome: "success",
      userId: req.user?.id,
      userEmail: req.user?.email,
      role: req.user?.role,
      targetType: "user",
      targetId: String(req.user?.id || ""),
      ...auditContextFromReq(req),
    });
    return res.json({ message: "Password u ndryshua me sukses" });
  } catch (err) {
    logModuleError("users", "password_change", err);
    return res.status(500).json({ message: err.message });
  }
}

async function requestPasswordReset(req, res) {
  const schema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
  });
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const { resetLink, delivered } = await userService.requestPasswordResetForEmail(value.email);
    const response = {
      message: delivered
        ? "Nëse email ekziston, u dërgua linku për reset password."
        : "Nëse email ekziston, linku për reset password u gjenerua.",
    };
    await saveAuditLog({
      module: "users",
      action: "request_password_reset",
      outcome: "success",
      targetType: "user_email",
      targetId: String(value.email).trim().toLowerCase(),
      ...auditContextFromReq(req),
    });
    if (String(process.env.EXPOSE_PASSWORD_RESET_LINK || "false").toLowerCase() === "true") {
      response.resetLink = resetLink;
    }
    return res.json(response);
  } catch (err) {
    logModuleError("users", "password_reset_request", err);
    return res.status(500).json({ message: err.message });
  }
}

async function resetPassword(req, res) {
  const schema = Joi.object({
    token: Joi.string().min(20).required(),
    new_password: Joi.string().min(6).max(200).required(),
  });
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const r = await userService.resetPasswordByToken(value.token, value.new_password);
    if (!r.ok) {
      const msg =
        r.reason === "used"
          ? "Token është përdorur"
          : r.reason === "expired"
            ? "Token është skaduar"
            : "Token i pavlefshëm";
      await saveAuditLog({
        module: "users",
        action: "reset_password",
        outcome: "failure",
        message: msg,
        ...auditContextFromReq(req),
      });
      return res.status(400).json({ message: msg });
    }
    await saveAuditLog({
      module: "users",
      action: "reset_password",
      outcome: "success",
      targetType: "user",
      targetId: String(r.userId),
      ...auditContextFromReq(req),
    });
    return res.json({ message: "Password u resetua me sukses" });
  } catch (err) {
    logModuleError("users", "password_reset_confirm", err);
    return res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getMe,
  listAll,
  getOne,
  create,
  update,
  remove,
  requestActivation,
  activate,
  changePassword,
  requestPasswordReset,
  resetPassword,
};
