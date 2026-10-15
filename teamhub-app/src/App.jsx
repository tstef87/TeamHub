import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";

// Import Scenes 
import Login from "./scenes/login/index.jsx"
import CreateTeam from "./scenes/team_pages/teams/create_team"
import HomePage from "./scenes/home_page"
import NotFound from "./scenes/not_found"
import Teams from "./scenes/team_pages/teams"
import Team from "./scenes/team_pages/teams/team"
import CreateAccount from "./scenes/create_acc";

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Create-Account" element={<CreateAccount />} />
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