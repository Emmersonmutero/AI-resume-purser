import React from "react";
import { SignIn } from "@clerk/clerk-react";
import "../styles/Login.css";

export default function Login() {
  return (
    <div className="login-wrapper">
      <div className="login">
        <div className="login__card animated">
          <header className="login__header">
            <h2 className="login__title">Welcome</h2>
            <p className="login__subtitle">Sign in to continue</p>
          </header>
          <div className="clerk-signin">
            <SignIn
              afterSignInUrl="/dashboard"
              signUpUrl="/register"
              appearance={{
                elements: {
                  formButtonPrimary: "login__submit",
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
