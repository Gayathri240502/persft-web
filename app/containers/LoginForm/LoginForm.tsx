"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Spinner from "../../components/spinner/Spinner";

const LoginForm = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError(null);

      console.log("Attempting login...");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      let data;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        throw new Error("Invalid response from server");
      }

      console.log("Login response status:", response.status);
      console.log("Login response:", data);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid username or password");
        } else if (response.status === 404) {
          throw new Error("User not found");
        } else if (data.message) {
          throw new Error(data.message);
        } else {
          throw new Error("An error occurred during login. Please try again.");
        }
      }

      // Store the token
      document.cookie = `token=${data.access_token}; path=/`;
      localStorage.setItem("token", data.access_token);

      // Extract and store role from JWT
      const base64Url = data.access_token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const decodedToken = JSON.parse(jsonPayload);
      localStorage.setItem("role", decodedToken.realm_access.roles[0]);

      console.log("Login successful, redirecting to dashboard...");

      // Force a hard navigation to dashboard
      window.location.href = "/admin/dashboard";
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err instanceof Error ? err.message : "Invalid username or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto p-2 max-w-md">
      <h1 className="text-2xl font-bold text-[#161e54] text-center mb-6">
        Login
      </h1>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium  
    ${loading ? "bg-[#09B6E9] cursor-not-allowed" : "bg-[#309416] hover:bg-[#09B6E9]"} 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#309416]`}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center">
              <span className="animate-spin border-2  border-t-transparent rounded-full w-5 h-5 mr-2"></span>
              Logging in...
            </div>
          ) : (
            "Login"
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
