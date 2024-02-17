import "./App.css";
import axios from "axios";
import { useState } from "react";
import { lorenIpsum } from "./stuff";

function App() {
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [paperUrl, setPaperUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [paperText, setPaperText] = useState(false);
  const [paperTitle, setPaperTitle] = useState("");
  const [abstractSummary, setAbstractSummary] = useState("");

  const parsePaper = () => {
    axios
      .post("http://localhost:8080/parsePaper", { paperUrl: paperUrl })
      .then(async (paperTextFileResponse) => {
        setFetching(false);
        const paperTextFile = paperTextFileResponse.data;
        console.log(paperTextFile);
        const paperText_ = await (await fetch(paperTextFile.Url)).text();
        console.log(paperText_);
        setPaperText(paperText_);
        setShowUploadPanel(false);
      });
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
              setFetching(true);
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
                cursor: "pointer",
                fontWeight: 700,
                marginTop: 8,
              }}
              disabled={fetching}
            >
              {!fetching ? "Parse Paper" : "Parsing your paper..."}
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
            width: "100%",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: 20,
          }}
        >
          <p
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: paperTitle ? "black" : "gray",
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
