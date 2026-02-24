export function saveAuth({ token, role, user_id }) {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  localStorage.setItem("user_id", String(user_id));
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user_id");
}

export function isAuthed() {
  return !!localStorage.getItem("token");
}

export function getRole() {
  return localStorage.getItem("role") || "";
}

export function getAuth() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const user_id = localStorage.getItem("user_id");

  if (!token) return null;

  return {
    token,
    role,
    user_id: user_id ? Number(user_id) : null,
  };
}