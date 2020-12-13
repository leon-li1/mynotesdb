const { User, validate } = require("../models/user");
const express = require("express");
const router = express.Router();
const _ = require("lodash");

router.get("/all", async (req, res) => {
  const users = await User.find().sort({ name: 1 });
  res.send(users);
});

router.post("/add", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered");

  const newUser = new User(_.pick(req.body, ["name", "email", "password"]));

  newUser.save();
  res.send(_.pick(newUser, ["name", "email", "id"]));
});

module.exports = router;
