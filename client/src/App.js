import "./App.css";
import axios from "axios";
import { useState } from "react";

function App() {
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [paperUrl, setPaperUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [paperText, setPaperText] = useState(false);

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
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          height: 80,
          display: "flex",
          flexDirection: "column",
          paddingLeft: 24,
          backgroundColor: "white",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          width: "100%",
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
      <div style={{ height: 1, backgroundColor: "lightgray", width: "100%" }} />
      <button
        // onClick={apiCall}
        onClick={() => setShowUploadPanel(!showUploadPanel)}
        style={{
          marginTop: 100,
          padding: 20,
          borderRadius: 8,
          border: "none",
          width: "fit-content",
          backgroundColor: "mediumseagreen",
          color: "white",
          fontSize: 16,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Upload Paper
      </button>

      {showUploadPanel && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            parsePaper();
            setFetching(true);
          }}
          style={{
            padding: 20,
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
          <p>Paste url:</p>
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
              marginTop: 20,
              cursor: "pointer",
              fontWeight: 700,
            }}
            disabled={fetching}
          >
            {!fetching ? "Parse Paper" : "Parsing your paper..."}
          </button>
        </form>
      )}
      {paperText && <p>{paperText}</p>}
    </div>
  );
}

export default App;
