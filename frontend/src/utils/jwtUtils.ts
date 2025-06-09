import { jwtDecode } from "jwt-decode";


interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
}

export function getUserRole(): string | null {
  const token = localStorage.getItem('jwtToken');
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.role;
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
}
