const Joi = require("joi");
const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    minlength: 4,
    maxlength: 100,
  },
  body: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isDone: Boolean,
  ageofUser: {
    type: Number,
    min: 8,
    max: 99,
  },
});

const Note = mongoose.model("Note", noteSchema);

const validateSchema = (note) => {
  const schema = Joi.object({
    title: Joi.string().min(4).max(100).required(),
    body: Joi.string(),
    isDone: Joi.boolean(),
    ageofUser: Joi.number().min(8).max(99),
  });
  return schema.validate(note);
};

exports.Note = Note;
exports.validate = validateSchema;
