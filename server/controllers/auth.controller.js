const {
  registerUser,
  loginUser,
  getProfile,
} = require("../services/auth.service");
const register = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await registerUser({
      full_name,
      email,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "Recruiter registered successfully",
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const data = await loginUser(email, password);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      ...data,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};
const profile = async (req, res) => {
  try {
    const user = await getProfile(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  profile,
};