import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h1>404 – Page Not Found</h1>
      <p>Sorry, we couldn’t find that page.</p>
      <Link to="/">Go Home</Link>
    </div>
  );
}
