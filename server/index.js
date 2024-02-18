import express from "express";
import cors from "cors";
import ConvertAPI from "convertapi";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

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
    50000
  )}\n\nReturn a summary of the abstract of this paper in the following format: {"abstractSummary": "<summary of abstract>"}`;

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

const splitText = async (paperText) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
  });

  return await splitter.splitText(paperText);
};

const createEmbeddings = async (listOfText) => {
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      Authorization: `Bearer ${togetherAiApiKey}`,
    },
    body: JSON.stringify({
      model: "togethercomputer/m2-bert-80M-8k-retrieval",
      input: listOfText,
    }),
  };

  const responseJson = await (
    await fetch("https://api.together.xyz/v1/embeddings", options)
  ).json();

  console.log("created embeddings...");
  const embeddingsObjects = responseJson.data;
  const embeddings = embeddingsObjects.map(
    (embeddingObject) => embeddingObject.embedding
  );
  console.log(embeddings);
  const paperEmbeddingsAndText = embeddings.map((embedding, index) => ({
    embedding: embedding,
    text: listOfText[index],
  }));
  return paperEmbeddingsAndText;
};

app.post("/createPaperEmbeddings", async (req, res) => {
  const paperText = req.body.paperText;
  const splitPaperText = await splitText(paperText);
  console.log("this is the split text");
  console.log(splitPaperText);
  const embeddingsAndText = await createEmbeddings(splitPaperText);
  res.send(embeddingsAndText);
});

app.post("/createQueryEmbedding", async (req, res) => {
  const userQuery = req.body.userQuery;
  const embeddingAndQuery = await createEmbeddings(userQuery);
  console.log("got prompt embedding");
  console.log(embeddingAndQuery);
  res.send(embeddingAndQuery[0].embedding);
});

app.post("/questionAnswering", async (req, res) => {
  console.log("entered question answering...");
  const query = req.body.query;
  const relatedPartsOfPaper = req.body.relatedPartsOfPaper;

  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: `Bearer ${togetherAiApiKey}`,
  });

  const data = {
    model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
    max_tokens: 1024,
    messages: [
      {
        role: "system",
        content:
          "You are a chatbot, only answer the question by using the provided context. If your are unable to answer the question using the provided context, say so.",
      },
      {
        role: "user",
        content: `Here is parts of a research paper that may be relevant to my question: ${JSON.stringify(
          relatedPartsOfPaper
        )}`,
      },
      {
        role: "user",
        content: `Here is my question: ${query}`,
      },
    ],
  };

  const options = {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  };

  console.log("fetching response...");
  fetch("https://api.together.xyz/v1/completions", options)
    .then((response) => response.json())
    .then((response) => {
      console.log("got the response...");
      console.log(response);
      const responseText = response.choices[0].text;
      res.send(responseText);
    })
    .catch((err) => res.send(err));
});
