const dotenv = require("dotenv");
dotenv.config();
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const session = require("express-session");

const MongodbStore = require("connect-mongodb-session")(session);

const errorController = require("./controllers/error");
// const mongoConnect = require("./util/database").mongoConnect;
const User = require("./models/user");

const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_ACCOUNT_LOGIN}:${process.env.MONGODB_ACCOUNT_PASSWORD}@cluster0.6zbsqj2.mongodb.net/shop`;

const app = express();
const store = new MongodbStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({secret: "my secret", resave: false, saveUninitialized: false, store: store}));

app.use((req, res, next) => {
  if(!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI)
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
