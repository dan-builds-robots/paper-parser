import "./App.css";
import axios from "axios";
import { useState } from "react";
import { examplePaperText, lorenIpsum } from "./stuff";

function App() {
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [paperUrl, setPaperUrl] = useState("");
  const [parsingPaper, setParsingPaper] = useState(false);

  // paper information
  const [paperTitle, setPaperTitle] = useState("");
  const [abstractSummary, setAbstractSummary] = useState("");
  const [githubLink, setGithubLink] = useState("");

  const resetPaper = () => {
    setPaperTitle("");
    setAbstractSummary("");
  };
  const parsePaper = async () => {
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

    // get title of paper
    extractPaperTitle(paperText);

    // get summary of paper's abstract
    extractPaperAbstractSummary(paperText);

    const githubLinks = getGitHubLinks(paperText);
    console.log(`github links...`);
    console.log(githubLinks);

    const _githubLink = githubLinks[1][0];
    setGithubLink(_githubLink);
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

  const getGitHubLinks = (text) => {
    let splitText = text.split(/[\s \n]+/);
    let mainLinks = [];
    let refLinks = [];
    let refIndex = splitText.lastIndexOf("References");

    function clean_and_append(link, linksList) {
      if (link.slice(-1) === ".") linksList.push(link.slice(0, -1));
      else linksList.push(link);
    }

    for (let i = 0; i < splitText.length; i++) {
      if (splitText[i].toLowerCase().includes("github.com")) {
        if (i < refIndex) clean_and_append(splitText[i], mainLinks);
        else clean_and_append(splitText[i], refLinks);
      }
    }
    return [mainLinks, refLinks];
  };

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
                color: "mediumseagreen",
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
                backgroundColor: "mediumseagreen",
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
                backgroundColor: "mediumseagreen",
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
              {abstractSummary ? abstractSummary : lorenIpsum}
            </div>
          </div>

          {/* right side */}
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
              {abstractSummary ? abstractSummary : lorenIpsum}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
