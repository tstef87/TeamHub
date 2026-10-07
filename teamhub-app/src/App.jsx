import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";

// Import Scenes 
import Login from "./scenes/login/index.jsx"
import CreateOrg from "./scenes/create_org"
import HomePage from "./scenes/home_page"
import NotFound from "./scenes/not_found"
import MyTeams from "./scenes/teams/my_teams"

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Create-Org" element={<CreateOrg />} />
          <Route path="/My-Teams" element={<MyTeams />} />

          {/* 404 Not Found Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;