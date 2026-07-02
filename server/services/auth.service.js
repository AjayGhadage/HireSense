const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const registerUser = async (userData) => {
  const { full_name, email, password } = userData;

  const existingUser = await User.findOne({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    full_name,
    email,
    password: hashedPassword,
    role: "recruiter",
  });

  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
  };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return {
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    },
  };
};

const getProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: {
      exclude: ["password"],
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
};