import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main style={{ textAlign: "center", marginTop: "4rem" }}>
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist or has moved.</p>
      <Link to="/">Back to home</Link>
    </main>
  );
}
