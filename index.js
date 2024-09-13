const express = require("express");
const urlRoute = require("./routes/url");
const URL = require("./models/url");
const { connectToDb } = require("./connect");
const app = express();
const port = 8001;

connectToDb("mongodb://127.0.0.1:27017/short-url")
  .then(() => {
    console.log("Connected to DB.");
  })
  .catch((e) => {
    console.log(e);
  });

app.use(express.json());

app.use("/url", urlRoute);

app.get("/:shortId", async (req, res) => {
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

app.listen(port, () => {
  console.log(`Server started at PORT ${port}`);
});
