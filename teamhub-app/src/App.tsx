import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./components/layout/AppShell";
import { AuthProvider } from "./context/AuthContext";

// Scenes (same URL paths as before, plus Messages and Profile)
import CreateAccount from "./scenes/create_acc";
import HomePage from "./scenes/home_page";
import Login from "./scenes/login";
import Messages from "./scenes/messages";
import NotFound from "./scenes/not_found";
import Profile from "./scenes/profile";
import Teams from "./scenes/team_pages/teams";
import CreateTeam from "./scenes/team_pages/teams/create_team";
import Team from "./scenes/team_pages/teams/team";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/Login" element={<Login />} />
          <Route path="/Create-Account" element={<CreateAccount />} />

          {/* Everything below needs a signed-in user and shares the sidebar layout */}
          <Route element={<RequireAuth />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/Teams" element={<Teams />} />
            <Route path="/Teams/Create-Team" element={<CreateTeam />} />
            <Route path="/teams/:teamId" element={<Team />} />
            <Route path="/Messages" element={<Messages />} />
            <Route path="/Messages/:conversationId" element={<Messages />} />
            <Route path="/Profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
