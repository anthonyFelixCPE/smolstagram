import React from "react";
import "../styles/ForgotPassword.css";

function ForgotPassword() {
    return (
        <div className="forgotPassword-page">
            <div className="container">
                <h2>Recover your account</h2>
                <p>
                    Enter your email below, and we'll send you a verification
                    code to reset your password.
                </p>
                <input
                    type="text"
                    placeholder="Please enter your account email"
                />
                <button className="submit-button">Send Recovery Code</button>
				<p className="message">Enter message here</p>
            </div>
        </div>
    );
}

export default ForgotPassword;
