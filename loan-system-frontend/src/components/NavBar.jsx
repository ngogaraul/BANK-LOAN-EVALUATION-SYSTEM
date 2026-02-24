import { Link, useNavigate } from "react-router-dom";
import { clearAuth } from "../auth/auth";

export default function NavBar() {
  const navigate = useNavigate();

  function logout() {
    clearAuth();
    navigate("/login", { replace: true });
  }

  return (
    <div style={{ padding: 12, borderBottom: "1px solid #ddd", fontFamily: "sans-serif" }}>
      <Link to="/" style={{ marginRight: 12 }}>Dashboard</Link>
      <Link to="/applications" style={{ marginRight: 12 }}>Applications</Link>
      <button onClick={logout} style={{ float: "right" }}>Logout</button>
    </div>
  );
}