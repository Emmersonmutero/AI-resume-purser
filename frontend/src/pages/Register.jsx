import React from "react";
import { SignUp } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import "../styles/Register.css";

export default function Register() {

  
  
  
  return (
    <div className="register">
      <div className="register__card animated">
        <header className="register__header">
          <svg className="register__logo" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1 className="register__title">Create an Account</h1>
          <p className="register__subtitle">Join our community and start your journey</p>
        </header>
        <div className="clerk-signup">
          <SignUp
            afterSignUpUrl="/select-role"
            signInUrl="/login"
          />
        </div>
        <footer className="register__footer">
          Already have an account?{" "}
          <Link to="/login" className="register__link">
            Sign in
          </Link>
        </footer>
      </div>
    </div>
  );
}
