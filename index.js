// @ts-nocheck
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const authschema = require("./authmodel/authschema");
const { urlencoded } = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");
const exp = require("constants");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname + "/authview"));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "satyam", resave: false, saveUninitialized: true }));

mongoose.connect("mongodb://localhost:27017/auth", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database Connected");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { user, password } = req.body;
  const hashpass = await bcrypt.hash(password, 12);
  const adduser = new authschema({
    user,
    password: hashpass,
  });
  await adduser.save();
  req.session.user_id = adduser._id;
  res.redirect("/");
});

app.get("/", (req, res) => {
  res.send("Hey");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { user, password } = req.body;
  //   res.send(req.body);
  const availableUser = await authschema.findOne({ user });
  const validPass = await bcrypt.compare(password, availableUser.password);
  if (!validPass) {
    res.send("Invalid Credential");
  } else {
    req.session.user_id = availableUser._id;
    res.render("logout");
  }
});

app.get("/secret", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("login");
  } else {
    res.render("logout");
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id.destroy();
  res.redirect("login");
});

app.listen(1010, (req, res) => {
  console.log("1010");
});
