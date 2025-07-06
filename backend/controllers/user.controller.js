const { processRequest } = require("../helpers/error_handler.js");
const User = require("../models/user.model.js");
const bcrypt = require("bcrypt");

const saltRounds = 10;

const register = async (req, res) => {
  let { mail, password } = req.body;
  
  // Input validation
  if (!mail || !password) {
    return processRequest(
      {
        message: "Email and password are required!",
      },
      null,
      res
    );
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(mail)) {
    return processRequest(
      {
        message: "Please enter a valid email address!",
      },
      null,
      res
    );
  }

  // Password strength validation
  if (password.length < 6) {
    return processRequest(
      {
        message: "Password must be at least 6 characters long!",
      },
      null,
      res
    );
  }

  try {
    // mail already exists
    const existingUser = await User.findOne({ mail });
    if (existingUser) {
      return processRequest(
        {
          message: "Already registered!",
        },
        null,
        res
      );
    }

    // password hashing
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      mail,
      password: hashedPassword,
    });

    return processRequest(null, newUser, res);
  } catch (err) {
    console.log(err);
    return processRequest(err, null, res);
  }
};

const login = async (req, res) => {
  const { mail, password } = req.body;
  
  // Input validation
  if (!mail || !password) {
    return processRequest(
      {
        message: "Email and password are required!",
      },
      null,
      res
    );
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(mail)) {
    return processRequest(
      {
        message: "Please enter a valid email address!",
      },
      null,
      res
    );
  }

  try {
    const user = await User.findOne({ mail });

    // matching password
    let isMatch = false;
    if (user) {
      isMatch = await bcrypt.compare(password, user.password);
    }
    if (!user || !isMatch)
      return processRequest({ message: "Wrong Credentials" }, null, res);
    
    return processRequest(null, user, res);
  } catch (err) {
    console.log(err);
    return processRequest(err, null, res);
  }
};

module.exports = { register, login };