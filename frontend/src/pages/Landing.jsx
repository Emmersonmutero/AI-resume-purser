import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { FaRobot, FaChartLine, FaUserShield } from "react-icons/fa";
import "../styles/Landing.css"; // Ensure you have this CSS file for styling
export default function Landing() {
  return (
    <>
      <Navbar />
      <main className="landing-container">
        <section className="hero">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Parse resumes. Match faster. Hire smarter.</h1>
              <p className="hero-subtext">
                Secure, AI-powered resume parsing with real-time analytics and role-based dashboards.
              </p>
              <div className="cta-buttons">
                <Link className="btn primary-btn" to="/register">Get Started</Link>
                <Link className="btn secondary-btn" to="/login">I already have an account</Link>
              </div>
            </div>
            <div className="hero-img-wrapper">
              <img
                className="hero-img"
                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80"
                alt="Resume Parsing Illustration"
              />
            </div>
          </div>
        </section>

        <section className="features-section">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <FaRobot className="feature-icon" />
              <h3>AI-Powered Resume Parsing</h3>
              <p>
                Quickly and accurately extract relevant details from resumes using our advanced AI.
              </p>
            </div>
            <div className="feature-card">
              <FaChartLine className="feature-icon" />
              <h3>Real-Time Analytics</h3>
              <p>
                Gain instant, actionable insights into your hiring pipeline with live dashboards.
              </p>
            </div>
            <div className="feature-card">
              <FaUserShield className="feature-icon" />
              <h3>Role-Based Dashboards</h3>
              <p>
                Personalize your dashboard for recruiters, managers, and admins—see only what you need.
              </p>
            </div>
          </div>
        </section>

        <section className="testimonials-section">
          <h2>What Our Users Say</h2>
          <div className="testimonials">
            <div className="testimonial-card">
              <p>
                "This platform has revolutionized our hiring process. The AI-powered resume parsing is
                incredibly accurate and has saved us countless hours."
              </p>
              <span className="testimonial-author">– John Doe, Hiring Manager</span>
            </div>
            <div className="testimonial-card">
              <p>
                "The real-time analytics dashboard has given us valuable insights into our hiring process. We can now
                make data-driven decisions and optimize our process."
              </p>
              <span className="testimonial-author">– Jane Smith, Recruiter</span>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <h2>Get Started Today</h2>
          <p>
            Sign up for a free trial and experience next-generation AI-powered resume parsing and analytics.
          </p>
          <Link className="btn primary-btn" to="/register">
            Sign Up For Free
          </Link>
        </section>
      </main>
    </>
  );
}
