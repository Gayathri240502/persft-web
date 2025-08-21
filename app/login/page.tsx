"use client";
import Image from "next/image";
import Link from "next/link";
import LoginForm from "../containers/LoginForm/LoginForm";

const Login = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full max-w-[540px] mx-auto px-4">
        {/* Logo Section */}
        <div className="flex justify-center mb-8 w-auto h-auto">
          <Link href="/">
            <Image
              src="/logo.png"
              width={200}
              height={200}
              priority
              alt="Infy HMS"
              className="rounded-lg"
            />
          </Link>
        </div>

        {/* Login Form Container */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
