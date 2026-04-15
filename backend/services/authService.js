const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");

async function registerUser({ name, email, password }) {
  const existing = await userRepository.findUserByEmail(email);
  if (existing) {
    const error = new Error("Ky email ekziston");
    error.status = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await userRepository.createUser({
    name,
    email,
    password: hashedPassword,
    role: "client",
  });

  return { message: "Regjistrimi u krye me sukses" };
}

async function loginUser({ email, password }) {
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    const error = new Error("Përdoruesi nuk u gjet");
    error.status = 400;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Password i gabuar");
    error.status = 400;
    throw error;
  }

  const secret = process.env.JWT_SECRET || "sekreti123";
  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn: "1d" }
  );

  return {
    success: true,
    message: "Login me sukses",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

module.exports = {
  registerUser,
  loginUser,
};
