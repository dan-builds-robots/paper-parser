import logo from "./logo.svg";
import "./App.css";
import axios from "axios";

//data will be the string we send from our server
const apiCall = () => {
  axios.get("http://localhost:8080").then((data) => {
    //this console.log will be in our frontend console
    console.log(data);
  });
};

function App() {
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
        onClick={apiCall}
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
    </div>
  );
}

export default App;
