import express from "express";
import cors from "cors";
import ConvertAPI from "convertapi";

// for api endpoints
const app = express();
app.use(cors());
app.use(express.json());

// togetherAI for parsing paper
const togetherAiApiKey = `144629e6c6117568ac2c1d3646c1c574828cee3d6f81fd30b75b46d1548cd0b2`;

const getTogetherAiOptions = (prompt) => {
  return {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      Authorization: `Bearer ${togetherAiApiKey}`,
    },

    body: JSON.stringify({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      prompt: prompt,
      max_tokens: 512,
      stop: ["</s>", "[/INST]"],
      temperature: 0.7,
      top_p: 0.7,
      top_k: 50,
      repetition_penalty: 1,
      n: 1,
    }),
  };
};

// for scraping text from paper pdf
const convertapi = ConvertAPI("MXRK9lRTHxS6nXYt");

app.listen(8080, () => {
  console.log("server listening on port 8080");
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

app.post("/extractPaperTitle", async (req, res) => {
  const paperText = req.body.paperText;
  console.log("paperText");
  console.log(paperText);
  console.log(typeof paperText);

  const prompt = `Below is the first several words of a research paper: \n${req.body.paperText.substring(
    0,
    500
  )}\nReturn the title of this paper in this JSON format: {"paperTitle": "<Title of Paper>"}`;

  console.log(`here is the prompt:`);
  console.log(prompt);

  fetch("https://api.together.xyz/v1/completions", getTogetherAiOptions(prompt))
    .then((response) => response.json())
    .then((response) => {
      console.log(response);
      const paperTitleJsonString = response.choices[0].text;
      const paperTitle = JSON.parse(paperTitleJsonString).paperTitle;
      res.send(paperTitle);
    })
    .catch((err) => res.send(err));
});

app.post("/extractPaperAbstractSummary", async (req, res) => {
  const paperText = req.body.paperText;
  console.log("paperText");
  console.log(paperText);
  console.log(typeof paperText);

  const prompt = `Below is the first several words of a research paper: \n${req.body.paperText.substring(
    0,
    1000
  )}\nReturn a summary of the abstract of this paper in the following format: {"abstractSummary": "<summary of abstract>"}`;

  console.log(`here is the prompt:`);
  console.log(prompt);

  fetch("https://api.together.xyz/v1/completions", getTogetherAiOptions(prompt))
    .then((response) => response.json())
    .then((response) => {
      console.log(response);
      const abstractSummaryJsonString = response.choices[0].text;
      const paperAbstractSummary = JSON.parse(
        abstractSummaryJsonString
      ).abstractSummary;
      res.send(paperAbstractSummary);
    })
    .catch((err) => res.send(err));
});
