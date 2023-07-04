import "./App.css";
import { Login } from "./data/component/login";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Geo } from "./geolocation";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index path="/" element={<Login />} />
        <Route path="/geolocation" element={<Geo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
