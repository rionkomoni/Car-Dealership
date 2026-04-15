const mongoose = require("mongoose");
const Contact = require("../models/Contact");

function isMongoReady() {
  return mongoose.connection.readyState === 1;
}

async function countContacts() {
  if (!isMongoReady()) return 0;
  return Contact.countDocuments();
}

module.exports = {
  isMongoReady,
  countContacts,
};
