const Contact = require("../models/Contact");

async function countContacts() {
  return Contact.countDocuments();
}

async function listContacts() {
  return Contact.find().sort({ createdAt: -1 }).lean();
}

module.exports = {
  countContacts,
  listContacts,
};

