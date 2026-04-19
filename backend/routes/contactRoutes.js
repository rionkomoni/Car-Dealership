const express = require("express");
const Joi = require("joi");
const mongoose = require("mongoose");
const Contact = require("../models/Contact");
const requireAdmin = require("../middleware/requireAdmin");
const { logModuleEvent } = require("../lib/moduleLogger");

const router = express.Router();

router.post("/", async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    message: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message:
        "MongoDB is not connected. Start MongoDB and restart the API server.",
    });
  }

  try {
    const newContact = await Contact.create(req.body);
    logModuleEvent("businessOperations", "contact_create", {
      contactId: String(newContact._id),
    });
    return res.status(201).json({
      message: "Mesazhi u ruajt me sukses",
      data: newContact,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/", requireAdmin, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const messages = await Contact.find().sort({ createdAt: -1 }).lean();
    logModuleEvent("reporting", "contact_inbox_read", { adminId: req.user?.id });
    return res.json(messages);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
