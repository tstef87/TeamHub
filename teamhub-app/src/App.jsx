import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";

// Import Scenes 
import Login from "./scenes/login/index.jsx"
import CreateTeam from "./scenes/TeamPages/teams/create_team"
import HomePage from "./scenes/HomePage"
import NotFound from "./scenes/NotFound"
import Teams from "./scenes/TeamPages/teams"
import Team from "./scenes/TeamPages/teams/team"

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Teams" element={<Teams />} />
          <Route path="/Teams/Create-Team" element={<CreateTeam />} />

          {/* Selected Team Page */}
          <Route path="/teams/:teamId" element={<Team />} />

          {/* 404 Not Found Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;