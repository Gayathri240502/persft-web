interface DecodedToken {
  name: string;
  sub: string;
  email: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  exp: number;
  realm_access: {
    roles: string[];
  };
}
export function decodeJwt(token: string): DecodedToken | null {
  try {
    if (!token || token.split(".").length !== 3) {
      throw new Error("Invalid JWT format");
    }

    const base64Url = token.split(".")[1];
    if (!base64Url) throw new Error("Missing payload in token");

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeJwt(token);
  if (!decoded) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp <= currentTime;
}
