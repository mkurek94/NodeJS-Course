const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const errorController = require("./controllers/error");
// const mongoConnect = require("./util/database").mongoConnect;
const User = require("./models/user");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("643c1e13d0867ce5aca2a681")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect("mongodb+srv://admin:admin@cluster0.6zbsqj2.mongodb.net/shop")
  .then((res) => {
    User.findOne().then((user) => {
      if (!user) {
        const newUser = new User({
          name: "TestUser",
          email: "test@test.com",
          cart: { items: [] },
        });
        newUser.save();
      }
    });
    app.listen(9999);
  })
  .catch((err) => {
    console.log(err);
    throw err;
  });

// mongoConnect(() => {
//   app.listen(9999);
// });
