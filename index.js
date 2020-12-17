const winston = require("winston");
const express = require("express");
const app = express();

require("dotenv").config();
require("./startup/logging")();
require("./startup/config")();
require("./startup/prod")(app);
require("./startup/routes")(app);
require("./startup/db")();

const port = process.env.PORT;
app.listen(port, () => winston.info(`Listening on port ${port}...`));
