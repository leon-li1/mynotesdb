const notes = require("./routes/notes");
const users = require("./routes/users");
const auth = require("./routes/auth");
const config = require("config");
const mongoose = require("mongoose");
const express = require("express");
const app = express();

if (!config.get("jwtPrivateKey")) {
  console.error("FATAL ERROR: jwtPrivateKey is not defined");
  process.exit(1);
}

mongoose
  .connect("mongodb://localhost/mynotesdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Connected!"))
  .catch(() => console.log("Something went wrong when connecting!"));

app.use(express.json());
app.use("/notes", notes);
app.use("/api/users", users);
app.use("/api/auth", auth);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
