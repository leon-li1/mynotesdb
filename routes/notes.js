const { Note, validate } = require("../models/note");
const express = require("express");
const router = express.Router();

router.get("/notes/all", async (req, res) => {
  const notes = await Note.find().sort({ title: 1 });
  res.send(notes);
});

router.post("/notes/add", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const newNote = new Note({
    title: req.body.title,
    body: req.body.body,
    isDone: req.body.isDone,
    ageofUser: req.body.ageofUser,
  });
  newNote.save();
  res.send(newNote);
});

router.put("/notes/update/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const updatedNote = await Note.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      body: req.body.body,
      isDone: req.body.isDone,
      ageofUser: req.body.ageofUser,
    },
    { new: true }
  );

  if (!updatedNote)
    return res.status(404).send("The note with the given ID was not found");

  res.send(updatedNote);
});

router.delete("/notes/delete/:id", async (req, res) => {
  const deletedNote = await Note.findByIdAndRemove(req.params.id);

  if (!deletedNote)
    return res.status(404).send("The Note with the given ID was not found.");

  res.send(deletedNote);
});

module.exports = router;
