console.log("flag1");
const notes = require("./routes/notes");
const users = require("./routes/users");
const auth = require("./routes/auth");
const config = require("config");
const mongoose = require("mongoose");
const express = require("express");
const app = express();
require("./startup/prod")(app);

console.log("flag2");
if (!config.get("jwtPrivateKey")) {
  console.error("FATAL ERROR: jwtPrivateKey is not defined");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URL || "mongodb://localhost/mynotesdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Connected!"))
  .catch(() => console.log("Something went wrong when connecting!"));

console.log("flag3");
app.use(express.json());
app.use("/notes", notes);
app.use("/api/users", users);
app.use("/api/auth", auth);
console.log("flag4");
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
