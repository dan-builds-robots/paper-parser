//index.js
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

app.listen(8080, () => {
  console.log("server listening on port 8080");
});

app.get("/", (req, res) => {
  res.send("Hello from our server!");
});
