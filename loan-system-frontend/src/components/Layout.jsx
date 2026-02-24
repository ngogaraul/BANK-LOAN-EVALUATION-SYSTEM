import NavBar from "./NavBar";

export default function Layout({ children }) {
  return (
    <div>
      <NavBar />
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}