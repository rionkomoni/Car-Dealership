const express = require("express");
const Joi = require("joi");
const Contact = require("../models/Contact");

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

  try {
    const newContact = await Contact.create(req.body);
    return res.status(201).json({
      message: "Mesazhi u ruajt me sukses",
      data: newContact,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    return res.json(messages);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;