const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");

const port = process.env.PORT || 8000;

const app = express();

const main_router = require("./main_router");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(helmet());
app.use(compression());

app.use(morgan("dev"));

app.use("/api", main_router);

app.get("/", (req, res) => {
    res.send("Server's pretty healthy");
});

app.listen(port, () => console.log(`Server running successfully on port number: ${port}...`));