import "./App.css";
import axios from "axios";
import { useRef, useState } from "react";
import { examplePaperText, lorenIpsum } from "./stuff";

function hasFileExtension(fileName) {
  const parts = fileName.split(".");
  return parts.length > 1;
}

function App() {
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [paperUrl, setPaperUrl] = useState("");
  const [parsingPaper, setParsingPaper] = useState(false);

  // paper information
  const [paperTitle, setPaperTitle] = useState("");
  const [abstractSummary, setAbstractSummary] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [paperEmbeddings, setPaperEmbeddings] = useState([]);

  const [messages, setMessages] = useState([]);
  const [userQuery, setUserQuery] = useState("");

  const resetPaper = () => {
    setPaperTitle("");
    setAbstractSummary("");
    setGithubLink("");
    setMessages([]);
    paperEmbeddings([]);
  };

  const parsePaper = async () => {
    resetPaper(true);
    setParsingPaper(true);
    // const paperTextFileResponse = await axios.post(
    //   "http://localhost:8080/parsePaper",
    //   { paperUrl: paperUrl }
    // );
    setParsingPaper(false);
    // const paperTextFile = paperTextFileResponse.data;
    // const paperText = await (await fetch(paperTextFile.Url)).text();
    const paperText = examplePaperText;
    console.log(paperText);
    setShowUploadPanel(false);

    // get title of paper
    await extractPaperTitle(paperText);

    // get summary of paper's abstract
    await extractPaperAbstractSummary(paperText);

    // get github link
    const githubLink = getGithubLink(paperText);
    setGithubLink(githubLink);
    getGitFiles();

    // get embeddings for paper
    await getPaperEmbeddings(paperText);
  };

  const submitQuery = async () => {
    setMessages([...messages, { sender: "You", messageContent: userQuery }]);
    const oldUserQuery = userQuery;
    setUserQuery("");
    const messageHistory = document.getElementById("messageHistory");
    messageHistory.scrollTop = messageHistory.scrollHeight + 100900;

    const queryEmbeddingResponse = await axios.post(
      "http://localhost:8080/createQueryEmbedding",
      { userQuery: oldUserQuery }
    );

    const queryEmbedding = queryEmbeddingResponse.data;
    const relatedPartsOfPaper = getRelevantPartsOfPaper(
      paperEmbeddings,
      queryEmbedding
    );

    axios
      .post("http://localhost:8080/questionAnswering", {
        query: oldUserQuery,
        relatedPartsOfPaper: relatedPartsOfPaper,
      })
      .then((response) => {
        setMessages([
          ...messages,
          { sender: "You", messageContent: oldUserQuery },
          { sender: "PaperParser", messageContent: response.data },
        ]);
      });
  };

  const getPaperEmbeddings = async (paperText) => {
    const paperEmbeddingsResponse = await axios.post(
      "http://localhost:8080/createPaperEmbeddings",
      { paperText: paperText }
    );
    console.log("got embeddings...");
    console.log(paperEmbeddingsResponse.data);
    setPaperEmbeddings(paperEmbeddingsResponse.data);
  };

  const extractPaperTitle = async (paperText) => {
    console.log("extracting title...");
    const response = await axios.post(
      "http://localhost:8080/extractPaperTitle",
      {
        paperText: paperText,
      }
    );
    console.log("got title response:");
    console.log(response);
    setPaperTitle(response.data);
  };

  const extractPaperAbstractSummary = async (paperText) => {
    console.log("extracting abstract summary...");
    const response = await axios.post(
      "http://localhost:8080/extractPaperAbstractSummary",
      {
        paperText: paperText,
      }
    );
    console.log("got abstract response:");
    console.log(response);
    setAbstractSummary(response.data);
  };

  const getGithubLink = (paperText) => {
    // remove all spaces
    paperText = paperText.replace(/[\n\s]/g, "");

    //   make text all lower case
    paperText = paperText.toLowerCase();

    let linkText = "github.com";
    let matchIndex = 0;
    let foundUrl = false;

    let url = "";
    for (let i = 0; i < paperText.length; i++) {
      if (foundUrl) {
        if ([",", "."].includes(paperText[i])) {
          break;
        }
        url += paperText[i];
        continue;
      }
      if (paperText[i] === linkText[matchIndex]) {
        matchIndex += 1;
      } else {
        matchIndex = 0;
      }

      if (matchIndex === linkText.length) {
        console.log("MATCH!");
        url = "https://github.com";
        foundUrl = true;
      }
    }
    return url;
  };

  const computeCosineSimilarity = (vectorA, vectorB) => {
    let dotproduct = 0;
    let mA = 0;
    let mB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotproduct += vectorA[i] * vectorB[i];
      mA += vectorA[i] * vectorA[i];
      mB += vectorB[i] * vectorB[i];
    }

    mA = Math.sqrt(mA);
    mB = Math.sqrt(mB);
    let similarity = dotproduct / (mA * mB);
    return similarity;
  };

  const getRelevantPartsOfPaper = (paperEmbeddings, promptEmbedding) => {
    const paperEmbeddingsSimilarities = paperEmbeddings.map(
      ({ embedding, text }) => ({
        embedding: embedding,
        text: text,
        similarity: computeCosineSimilarity(embedding, promptEmbedding),
      })
    );

    console.log(`similarities:`);
    console.log(paperEmbeddingsSimilarities);

    paperEmbeddingsSimilarities.sort(function (a, b) {
      return b.similarity - a.similarity;
    });

    return paperEmbeddingsSimilarities
      .slice(0, 10)
      .map(({ embedding, text, similarity }) => text);
  };

  const getGitFiles = () => {
    axios
      .post("http://localhost:8080/githubFiles", {
        repoUrl: githubLink,
      })
      .then(async (response) => {
        console.log("Content fetched:", response.data.content);
        const repoFiles = response.data.content;
        const parsedCodes = {};

        for (let file of repoFiles) {
          if (hasFileExtension(file)) {
            const parsedCode = await getGitCode(file);
            if (/\S/.test(parsedCode)) {
              // Check if contains non-whitespace characters
              parsedCodes[file] = parsedCode;
            }
            // console.log("parsed code", parsedCode)
            return getCodeSummaries(parsedCodes);
          }
        }
        console.log("parsed code", Object.keys(parsedCodes));
      })
      .catch((error) => {
        console.error("Error fetching content:", error);
      });
  };

  const getGitCode = async (file) => {
    const urlParts = githubLink.split("/");
    const owner = urlParts[urlParts.length - 2];
    const repoName = urlParts[urlParts.length - 1].replace(".git", "");
    const filePath = file;
    // console.log("current file", filePath);

    // Fetch file content using GitHub API
    return axios
      .get(
        `https://api.github.com/repos/${owner}/${repoName}/contents/${filePath}`
      )
      .then(async (response) => {
        const content = response.data.content
          ? atob(response.data.content)
          : ""; // Check if content is not falsy
        return content;
      })
      .catch((error) => {
        console.error("Error fetching content:", error);
      });
  };

  const getCodeSummaries = (parsedcodeMap) => {
    let summarizedCode = {};
    const filenames = Object.keys(parsedcodeMap);
    const sendRequest = async (filename) => {
      try {
        const response = await axios.post(
          "http://localhost:8080/githubSummaries",
          {
            parsedCode: parsedcodeMap[filename],
          }
        );
        console.log("Content fetched:", response.data.toString());
        summarizedCode[filename] = response.data.toString();
      } catch (error) {
        console.error("Error fetching content:", error);
      }
    };

    const sendRequestsSequentially = async () => {
      for (let filename of filenames) {
        await sendRequest(filename);
        // Add a delay between each request (e.g., 1 second)
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      console.log(summarizedCode);
    };
    sendRequestsSequentially();
  };

  //should be able to take output from getGitFiles and pass that into
  // another function that gets it code
  // then use a final 3rd function to take this code, sent it to together.ai
  // and also return its explanation/parsed infor back from together.ai

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100dvh",
      }}
    >
      {/* header */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: 100,
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        {/* header contents */}
        <div
          style={{
            backgroundColor: "white",
            alignItems: "center",
            display: "flex",
            flexDirection: "row",
            height: "100%",
          }}
        >
          <div
            style={{
              flex: 1,
              paddingLeft: 20,
              height: "100%",
              display: "flex",
              alignItems: "center",
            }}
          >
            <p
              style={{
                fontWeight: 600,
                fontSize: 24,
                color: "#7532a8",
                cursor: "pointer",
              }}
              onClick={(e) => {
                window.location.pathname = "/";
              }}
            >
              PaperParser
            </p>
          </div>

          <div
            style={{
              flex: 1,
              height: "100%",
              paddingRight: 20,
              display: "flex",
              flexDirection: "row-reverse",
              alignItems: "center",
            }}
          >
            <button
              onClick={() => setShowUploadPanel(true)}
              style={{
                padding: 20,
                borderRadius: 8,
                border: "none",
                width: "fit-content",
                backgroundColor: "#7532a8",
                color: "white",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                height: "fit-content",
              }}
            >
              Upload Paper
            </button>
          </div>
        </div>

        {/* bottom bar */}
        <div
          style={{
            height: 1,
            backgroundColor: "lightgray",
            width: "100%",
            alignSelf: "flex-end",
          }}
        />
      </div>

      {/* paste url panel */}
      {showUploadPanel && (
        <>
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              backgroundColor: "black",
              opacity: 0.5,
              zIndex: 3,
            }}
            onClick={() => setShowUploadPanel(false)}
          />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              parsePaper();
            }}
            style={{
              padding: 20,
              paddingTop: 24,
              paddingBottom: 24,
              borderRadius: 14,
              boxShadow: "1px 1px 6px rgba(0, 0, 0, 0.3)",
              position: "absolute",
              backgroundColor: "white",
              transform: "translate(-50%, -50%)",
              top: "50%",
              left: "50%",
              zIndex: 12,
              width: 700,
              maxWidth: "80%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <p
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 0,
                paddingBottom: 8,
              }}
            >
              Paste url:
            </p>
            <input
              autoFocus
              style={{
                height: 30,
                borderRadius: 8,
                border: "1px solid lightgray",
                padding: 8,
                fontSize: 16,
              }}
              defaultValue={paperUrl}
              onChange={(e) => setPaperUrl(e.currentTarget.value)}
            />
            <button
              style={{
                alignSelf: "flex-end",
                backgroundColor: "#7532a8",
                color: "white",
                fontSize: 16,
                padding: 12,
                borderRadius: 8,
                border: "none",
                cursor: parsingPaper ? "auto" : "pointer",
                fontWeight: 700,
                marginTop: 8,
                opacity: parsingPaper ? 0.5 : 1,
              }}
              disabled={parsingPaper}
            >
              {!parsingPaper ? "Parse Paper" : "Parsing your paper..."}
            </button>
          </form>
        </>
      )}

      {/* the paper */}
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flex: 1,
          overflow: "hidden",
        }}
      >
        {/* title */}
        <div
          style={{
            height: 120,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: 20,
            marginLeft: 32,
            marginRight: 32,
          }}
        >
          <p
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: paperTitle ? "black" : "gray",
              textAlign: "center",
            }}
          >
            {paperTitle ? paperTitle : "Paper Title"}
          </p>
        </div>

        {/* page contents */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            overflow: "hidden",
            height: `calc(100% - 100px)`,
            // justifyContent: "flex-start",
            flex: 1,
          }}
        >
          {/* left side */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "auto",
              padding: 32,
              margin: 16,
              paddingTop: 0,
              height: "inherit",
              lineHeight: 2,
            }}
          >
            {/* abstract */}
            <p style={{ fontWeight: 700, paddingBottom: 0 }}>
              Abstract AI Summary
            </p>
            <div
              style={{
                flex: 1,
                marginTop: 0,
                paddingBottom: 0,
                color: abstractSummary ? "black" : "gray",
              }}
            >
              {abstractSummary
                ? abstractSummary
                : "Abstract summary will appear here."}
            </div>

            {/* abstract */}
            <p style={{ fontWeight: 700, paddingBottom: 0 }}>Code Overview</p>
            <div
              style={{
                flex: 1,
                marginTop: 0,
                paddingBottom: 0,
                color: abstractSummary ? "black" : "gray",
              }}
            >
              {abstractSummary
                ? abstractSummary
                : "Code Overview will appear here."}
            </div>

            <div style={{ marginBottom: 16 }}>
              <p style={{ fontWeight: 700, paddingBottom: 0 }}>Github Link</p>
              <a
                href={githubLink ? githubLink : undefined}
                target="_blank"
                rel="noreferrer"
              >
                <p style={{ color: githubLink ? "black" : "gray" }}>
                  {githubLink ? githubLink : "no Github link in paper"}
                </p>
              </a>
            </div>
          </div>

          {/* right side */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "auto",
              height: "inherit",
              lineHeight: 2,
              padding: 32,
            }}
          >
            <div
              style={{
                flex: 1,
                width: "100%",
                alignItems: "center",
                display: "flex",
                margin: 0,
                overflow: "hidden",
                flexDirection: "column",
              }}
            >
              {/* history */}
              <div
                style={{
                  flex: 1,
                  width: "100%",
                  overflow: "auto",
                  marginBottom: 16,
                }}
                id={"messageHistory"}
              >
                {messages.map(({ sender, messageContent }, index) => {
                  return (
                    <div
                      style={{
                        borderRadius: 8,
                        backgroundColor: "rgb(240, 240, 240)",
                        padding: 8,
                        lineHeight: 1.5,
                        marginBottom: 16,
                      }}
                      key={`message ${index}`}
                    >
                      <p
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                        }}
                      >
                        {sender}
                      </p>
                      <span>{messageContent}</span>
                    </div>
                  );
                })}
              </div>

              {/* question-asking */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  float: "inline-end",
                  maxHeight: 100,
                  padding: 0,
                  margin: 0,
                }}
              >
                <textarea
                  // disabled={paperTitle === ""}
                  autoFocus={paperTitle}
                  placeholder="Ask a question about this research paper"
                  style={{
                    borderRadius: 8,
                    margin: 0,
                    padding: 12,
                    lineHeight: 2,
                    border: "1px solid lightgray",
                    boxSizing: "border-box",
                    width: "100%",
                    // height: "100%",
                    fontFamily: "inherit",
                    resize: "none",
                    outline: "none",
                    verticalAlign: "top",
                    fontSize: 16,
                  }}
                  onFocus={(e) => e.preventDefault()}
                  value={userQuery}
                  onKeyDown={(e) => {
                    // user hit enter without shift
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submitQuery();
                    }
                  }}
                  onChange={(e) => {
                    setUserQuery(e.currentTarget.value);
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    backgroundColor: "#7532a8",
                    borderRadius: 8,
                    bottom: 8,
                    width: 34,
                    height: 34,
                    color: "white",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    right: 8,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                  onClick={(e) => submitQuery()}
                >
                  ↑
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
