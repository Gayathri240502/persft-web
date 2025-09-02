"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });

      if (!result) {
        setError("Unexpected error. Please try again.");
      } else if (result.error) {
        if (result.error === "CredentialsSignin") {
          setError("Invalid username or password.");
        } else {
          setError(result.error);
        }
      } else if (result.ok) {
        router.push("/verification");
      } else {
        setError("Authentication failed. Try again later.");
      }
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Restore persisted error after hot reload
  useEffect(() => {
    const saved = sessionStorage.getItem("login-error");
    if (saved) {
      setError(saved);
      setShowError(true);
    }
  }, []);

  // Handle fade + persistence
  useEffect(() => {
    if (error) {
      setShowError(true);
      sessionStorage.setItem("login-error", error);

      const timer = setTimeout(() => {
        setShowError(false);
        setTimeout(() => {
          setError(null);
          sessionStorage.removeItem("login-error");
        }, 500);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="relative">
      <div className="mx-auto p-4 max-w-md">
        <h1 className="text-2xl font-bold text-[#161e54] text-center mb-6">
          Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Username */}
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                focus:outline-none focus:ring-[#05344c] focus:border-[#05344c]"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm 
                  focus:outline-none focus:ring-[#05344c] focus:border-[#05344c]"
                required
              />
              <div className="absolute inset-y-0 right-2 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="focus:outline-none text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </button>
              </div>
            </div>
          </div>

          {/* Forgot link */}
          <div className="text-sm">
            Forgot Credentials?{" "}
            <a
              href="/forgot-credentials"
              className="text-blue-500 hover:underline"
            >
              Click here
            </a>
          </div>

          {/* Error */}
          {error && (
            <div
              className={`bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm 
                transition-opacity duration-500 ${showError ? "opacity-100" : "opacity-0"}`}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium 
              ${
                loading
                  ? "bg-[#1e5f7a] text-black cursor-not-allowed"
                  : "bg-[#05344c] text-white hover:bg-[#032635]"
              }
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#05344c]`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <span className="animate-spin border-4 border-t-transparent border-white rounded-full w-12 h-12 mb-3"></span>
            <p className="text-white text-sm font-medium">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
