const winston = require("winston");
const mongoose = require("mongoose");

module.exports = () => {
  mongoose
    .connect(process.env.MONGO_URL || "mongodb://localhost/mynotesdb", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .then(() => winston.info("Connected to MongoDB!"));
};
