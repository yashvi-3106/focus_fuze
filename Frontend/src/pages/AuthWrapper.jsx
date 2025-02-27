import { useState } from "react";
import Auth from "./Auth";
import SignIn from "./SignIn";
import "./Auth.css";

const AuthWrapper = () => {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className={`auth-container ${isSignIn ? "sign-in-mode" : ""}`}>
      <div className="form-wrapper">
        <SignIn toggleMode={() => setIsSignIn(false)} />
        <Auth toggleMode={() => setIsSignIn(true)} />
      </div>
      <div className="auth-image">
        <img src="https://img.freepik.com/free-vector/privacy-policy-concept-illustration_114360-7853.jpg" alt="Privacy Policy" />
      </div>
    </div>
  );
};

export default AuthWrapper;
