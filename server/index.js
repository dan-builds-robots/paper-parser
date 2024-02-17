import express from "express";
import cors from "cors";
import ConvertAPI from "convertapi";

const app = express();
app.use(cors());
app.use(express.json());

const convertapi = ConvertAPI("MXRK9lRTHxS6nXYt");

app.listen(8080, () => {
  console.log("server listening on port 8080");
});

app.get("/", (req, res) => {
  res.send("Hello from our server!");
});

app.post("/parsePaper", async (req, res) => {
  const paperUrl = req.body.paperUrl;
  console.log(`paperUrl: ${paperUrl}`);
  console.log("going to parse.....");
  const jsonResponse = await convertapi.convert(
    "txt",
    { File: paperUrl },
    "pdf"
  );

  const {
    response: { Files },
  } = jsonResponse;

  const paperTextFile = Files[0];
  console.log(paperTextFile);
  res.send(paperTextFile);
});
