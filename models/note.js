const Joi = require("joi");
const mongoose = require("mongoose");

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

exports.Note = Note;
exports.validate = validateSchema;
