const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Nuk ka token" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token i pavlefshëm" });
  }

  try {
    const decoded = jwt.verify(token, "sekreti123");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token i pavlefshëm ose i skaduar" });
  }
};

module.exports = auth;