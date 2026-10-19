import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";

// Import Scenes 
import Login from "./scenes/login/index.jsx"
import CreateOrg from "./scenes/create_org"
import HomePage from "./scenes/home_page"
import NotFound from "./scenes/not_found"
import CreateAccount from "./scenes/create_acc";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Create-Account" element={<CreateAccount />} />
<<<<<<< Updated upstream
          <Route path="/Create-Org" element={<CreateOrg />} />
=======

          <Route
            path="/Teams"
            element={
              <ProtectedRoute>
                <Teams />
              </ProtectedRoute>
            }
          />

          <Route
            path="/Teams/Create-Team"
            element={
              <ProtectedRoute>
                <CreateTeam />
              </ProtectedRoute>
            }
          />

          {/* Selected Team Page */}
          <Route
            path="/teams/:teamId"
            element={
              <ProtectedRoute>
                <Team />
              </ProtectedRoute>
            }
          />
>>>>>>> Stashed changes

          {/* 404 Not Found Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;