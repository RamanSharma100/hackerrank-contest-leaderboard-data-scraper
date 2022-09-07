const express = require("express");
const bodyParser = require("body-parser");
const ejsLayouts = require("express-ejs-layouts");

const app = express();

// Set up EJS
app.set("view engine", "ejs");
app.use(ejsLayouts);

// Set up body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set up static files
app.use(express.static(__dirname + "/public"));

// Routes

app.get("/", (req, res) => {
  return res.render("index", {
    error: "",
    message: "",
  });
});

app.use("/scrap", require("./scraper.route"));

app.get("*", (req, res) => {
  return res.redirect("/");
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
