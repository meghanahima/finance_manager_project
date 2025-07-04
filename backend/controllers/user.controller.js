const { processRequest } = require("../helpers/error_handler.js");
const User = require("../models/user.model.js");
const bcrypt = require("bcrypt");

const saltRounds = 10;

const register = async (req, res) => {
  let { mail, userName, password } = req.body;
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
      userName,
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
  try {
    const user = await User.findOne({ mail });

    // matching password
    let isMatch = false;
    if (user) {
      isMatch = bcrypt.compare(password, user.password);
    }
    if (!isMatch)
      return processRequest({ message: "Wrong Credentials" }, null, res);
    
    return processRequest(null, user, res);
  } catch (err) {
    console.log(err);
    return processRequest(err, null, res);
  }
};

module.exports = { register, login };
