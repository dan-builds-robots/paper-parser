import "./App.css";
import axios from "axios";
import { useState } from "react";
import { examplePaperText } from "./stuff";

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
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [chatbotEnabled, setChatbotEnabled] = useState(false);

  const [githubFiles, setGithubFiles] = useState([
    { title: "Select File", summary: "Summary will appear here." },
  ]);

  const resetPaper = () => {
    setPaperTitle("");
    setAbstractSummary("");
    setGithubLink("");
    setMessages([]);
    setPaperEmbeddings([]);
  };

  const parsePaper = async () => {
    resetPaper(true);
    setParsingPaper(true);
    const paperTextFileResponse = await axios.post(
      "http://localhost:8080/parsePaper",
      { paperUrl: paperUrl }
    );
    setParsingPaper(false);
    const paperTextFile = paperTextFileResponse.data;
    const paperText = await (await fetch(paperTextFile.Url)).text();
    // const paperText = examplePaperText;
    console.log(paperText);
    setShowUploadPanel(false);

    // get github link
    const githubLink = getGithubLink(paperText);
    setGithubLink(githubLink);

    // get title of paper
    await extractPaperTitle(paperText);

    // get summary of paper's abstract
    await extractPaperAbstractSummary(paperText);

    // get github files
    await getGitFiles(githubLink);

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

  const getGitFiles = async (githubLink) => {
    console.log("getting git files");
    const response = await axios.post("http://localhost:8080/githubFiles", {
      repoUrl: githubLink,
    });

    console.log("Content fetched:", response.data.content);
    const repoFiles = response.data.content;
    const parsedCodes = {};

    for (let file of repoFiles) {
      if (hasFileExtension(file)) {
        const parsedCode = await getGitCode(githubLink, file);
        if (/\S/.test(parsedCode)) {
          // Check if contains non-whitespace characters
          parsedCodes[file] = parsedCode;
        }
        console.log("parsed code", parsedCode);
      }
    }

    const codeSummaries = await getCodeSummaries(parsedCodes);
    console.log("code summaries:");
    console.log(codeSummaries);
    setGithubFiles(codeSummaries);

    console.log("parsed code", Object.keys(parsedCodes));

  };

  const getGitCode = async (githubLink, file) => {
    const urlParts = githubLink.split("/");
    console.log("urlParts", urlParts); 
    const owner = urlParts[urlParts.length - 2];
    console.log("owner", owner); 
    const repoName = urlParts[urlParts.length - 1].replace(".git", "");
    console.log("repo name", repoName); 
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

  const getCodeSummaries = async (parsedcodeMap) => {
    let summarizedCode = [];
    console.log("parsed code map:");
    console.log(parsedcodeMap);
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
        summarizedCode.push({
          title: filename,
          summary: response.data.toString(),
        });
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
    await sendRequestsSequentially();
    return summarizedCode;
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
            height: 90,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-start",
            paddingBottom: 20,
            width: "100%",
          }}
        >
          <p
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: paperTitle ? "black" : "gray",
              textAlign: "left",
              paddingLeft: 48,
              paddingRight: 48,
              // backgroundColor: "red",
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
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontWeight: 700, paddingBottom: 0 }}>Github Link</p>
              <a
                href={githubLink ? githubLink : undefined}
                target="_blank"
                rel="noreferrer"
              >
                <p style={{ color: githubLink ? "black" : "gray" }}>
                  {githubLink ? githubLink : "no Github link in paper."}
                </p>
              </a>
            </div>

            {/* code overview */}
            <p style={{ fontWeight: 700, paddingBottom: 0, marginBottom: 8 }}>
              File-by-File Code Overview
            </p>
            <div
              style={{
                flex: 1,
                marginTop: 0,
                paddingBottom: 0,
                color: githubFiles ? "black" : "gray",
              }}
            >
              {githubFiles.length ? (
                <div>
                  <select
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      borderColor: "lightgray",
                      outline: "none",
                      backgroundColor: "rgba(240, 240, 240, 1)",
                      fontSize: 14,
                    }}
                    onChange={(e) => setSelectedFileIndex(e.target.value)}
                  >
                    {githubFiles.map(({ title, summary }, index) => {
                      return <option value={index}>{title}</option>;
                    })}
                  </select>

                  <div
                    style={{
                      marginTop: 6,
                      color:
                        githubFiles[selectedFileIndex].title === "Select File"
                          ? "gray"
                          : "black",
                    }}
                  >
                    {githubFiles[selectedFileIndex].summary}
                  </div>
                </div>
              ) : (
                <p style={{ color: "gray" }}>Code Overview will appear here.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* chat bot */}
      {chatbotEnabled ? (
        <div
          style={{
            flex: 1,
            width: 400,
            border: "1px solid lightgray",
            height: 400,
            backgroundColor: "white",
            borderRadius: 8,
            alignItems: "center",
            display: "flex",
            margin: 0,
            overflow: "hidden",
            flexDirection: "column",
            position: "absolute",
            bottom: 16,
            right: 16,
          }}
        >
          {/* history */}
          <div
            style={{
              flex: 1,
              width: "100%",
              overflow: "auto",
              padding: 16,
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
                    marginLeft: 16,
                    marginRight: 16,
                    marginBottom: 16,
                    lineHeight: 1.5,
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

          <div
            style={{ height: 1, backgroundColor: "lightgray", width: "100%" }}
          />

          <textarea
            // disabled={paperTitle === ""}
            autoFocus={paperTitle}
            placeholder="Ask a question about this research paper"
            style={{
              margin: 0,
              padding: 12,
              lineHeight: 2,
              border: "0px solid lightgray",
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
      ) : (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            width: 140,
            height: 100,
            backgroundColor: "#7532a8",
            color: "white",
            borderRadius: 8,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: 800,
            fontSize: 16,
            textAlign: "center",
            cursor: "pointer",
          }}
          onClick={() => setChatbotEnabled(true)}
        >
          <p>Chat With This Paper</p>
        </div>
      )}
    </div>
  );
}

export default App;
