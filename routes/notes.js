const validateObjectId = require("../middleware/validateObjectId");
const admin = require("../middleware/admin");
const auth = require("../middleware/auth");
const validateUser = require("../middleware/validUser");
const { Note, validate } = require("../models/note");
const express = require("express");
const router = express.Router();
const _ = require("lodash");

router.get("/all", async (req, res) => {
  const notes = await Note.find().sort({ title: 1 });
  res.send(notes);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note)
    return res.status(404).send("The note with the given ID was not found");

  res.send(note);
});

router.post("/add", [auth, validateUser], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const newNote = new Note(
    _.pick(req.body, ["title", "body", "isDone", "ageofUser"])
  );
  newNote.save();
  res.send(newNote);
});

router.put("/update/:id", [auth, validateUser, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const updatedNote = await Note.findByIdAndUpdate(
    req.params.id,
    _.pick(req.body, ["title", "body", "isDone", "ageofUser"]),
    { new: true }
  );

  if (!updatedNote)
    return res.status(404).send("The note with the given ID was not found");

  res.send(updatedNote);
});

router.delete("/delete/:id", [auth, validateUser, admin], async (req, res) => {
  const deletedNote = await Note.findByIdAndRemove(req.params.id);

  if (!deletedNote)
    return res.status(404).send("The Note with the given ID was not found.");

  res.send(deletedNote);
});

module.exports = router;
