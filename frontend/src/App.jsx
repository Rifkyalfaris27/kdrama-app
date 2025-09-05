import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Home from "./pages/Home";
import { Routes, Route } from "react-router-dom";
import DetailMovie from "./pages/DetailMovie";

function App() {
  return (
    <Routes classname="bg-gray-950">
      <Route path="/home" element={<Home />} />
      <Route path="/detail/:title" element={<DetailMovie />} />
    </Routes>
  );
}

export default App;
