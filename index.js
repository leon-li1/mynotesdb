const mongoose = require("mongoose");
const Joi = require("joi");
const express = require("express");
const app = express();

mongoose
  .connect("mongodb://localhost/mynotesdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Connected!"))
  .catch(() => console.log("Something went wrong when connecting!"));

const noteSchema = new mongoose.Schema({
  title: String,
  body: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isDone: Boolean,
  ageofUser: {
    type: Number,
    required: true,
    min: 8,
    max: 99,
  },
});

const Note = mongoose.model("Note", noteSchema);

const validateSchema = (note) => {
  const schema = {
    title: Joi.string(),
    body: Joi.string().required(),
    isDone: Joi.boolean(),
    ageofUser: Joi.number().min(8).max(99).required(),
  };
  return Joi.validate(note, schema);
};

app.use(express.json());

app.get("/notes/all", async (req, res) => {
  const notes = await Note.find().sort({ title: 1 });
  res.send(notes);
});

app.post("/notes/add", async (req, res) => {
  const { error } = validateSchema(req.body);
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

app.put("/notes/update/:id", async (req, res) => {
  const { error } = validateSchema(req.body);
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

app.delete("/notes/delete/:id", async (req, res) => {
  const deletedNote = await Note.findByIdAndRemove(req.params.id);

  if (!deletedNote)
    return res.status(404).send("The Note with the given ID was not found.");

  res.send(deletedNote);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
