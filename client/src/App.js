import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import DocEditor from "./DocEditor.js";
import { v4 as uuidV4 } from "uuid"

function App() {
  return (
    <div className="App">
      <h1>Document Editor with Autosave</h1>
      <Routes>
        <Route path="/" exact element={<Navigate to={`/documents/${uuidV4()}`} replace />}/>
        <Route path="/documents/:id" element={<DocEditor />} />
      </Routes>
    </div>
  );
}

export default App;
