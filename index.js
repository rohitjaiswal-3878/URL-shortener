const express = require("express");

const URL = require("./models/url");
const { connectToDb } = require("./connect");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");

const port = 8001;

const urlRoute = require("./routes/url");
const staticRoutes = require("./routes/staticRouter");
const userRoutes = require("./routes/user");
const { restrictToLoggedInUserOnly, checkAuth } = require("./middlewares/auth");

connectToDb("mongodb://127.0.0.1:27017/short-url")
  .then(() => {
    console.log("Connected to DB.");
  })
  .catch((e) => {
    console.log(e);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use("/url", restrictToLoggedInUserOnly, urlRoute);
app.use("/user", userRoutes);
app.use("/", checkAuth, staticRoutes);

app.get("/api/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    }
  );

  res.redirect(entry.redirectURL);
});

app.get("/signup", (req, res) => {
  return res.render("signup");
});

app.get("/login", (req, res) => {
  return res.render("login");
});

app.listen(port, () => {
  console.log(`Server started at PORT ${port}`);
});
