"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";

type LoginFormData = {
  username: string;
  password: string;
};

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    roles?: string;
  }
}

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

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = {
      username,
      password,
    };
    try {
      setLoading(true);
      setError(null);

      const result = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (result?.ok) {
        const session = await getSession();
        if (session?.accessToken && session?.roles) {
          sessionStorage.setItem("token", session.accessToken);
          sessionStorage.setItem("role", session.roles);
          router.push(`admin/dashboard`);
        }
      } else {
        throw new Error("Login failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="mx-auto p-2 max-w-md">
      <h1 className="text-2xl font-bold text-[#161e54] text-center mb-2">
        Login
      </h1>

      <form onSubmit={onSubmit} className="grid gap-6">
        <div>
          <label htmlFor="username" className="block font-medium">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="w-full mt-2 p-2 border border-gray-300 rounded focus:border-[#ff8e4b] focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="password" className="block font-medium">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full mt-2 p-2 border border-gray-300 rounded focus:border-[#ff8e4b] focus:outline-none"
          />
        </div>

        {error && (
          <div
            id="error-message"
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4"
          >
            {error}
          </div>
        )}

        <div className="flex justify-center">
          <button
            type="submit"
            className={`w-full text-white py-3 rounded-md flex items-center justify-center ${
              loading ? "bg-gray-300 cursor-not-allowed" : "bg-[#05344c]"
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5 mr-2"></span>
                Please Wait
              </>
            ) : (
              "Login"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
