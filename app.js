const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan")
const port = process.env.PORT || 8000;

const app = express();

const main_router = require("./main_router");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(morgan("dev"));

app.use("/api", main_router);

app.get("/", (req, res) => {
    res.send("yes");
});

app.listen(port, "0.0.0.0");