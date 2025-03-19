import React from "react";
import "../styles/ForgotPassword.css";

function ForgotPassword() {
    return (
        <div className="forgotPassword-page">
            <div className="container enter-email">
                <h2>Recover your account</h2>
                <p>
                    Enter your email below, and we'll send you a verification
                    code to reset your password.
                </p>
                <input
                    type="text"
                    placeholder="Please enter your account email" required
                />
                <button className="submit-button">Send Recovery Code</button>
                <p className="message">Enter message here</p>
            </div>
            <div className="container enter-code">
                <h2>Enter your code</h2>
                <p>
                    Enter the verification code we sent to your email to reset
                    your password.
                </p>
				<input type="text" placeholder="Enter the code" required/>
				<div className="buttons-container">
					<button className="back-button">Back</button>
					<button className="submit-button">Submit</button>
				</div>
                <p className="message">Enter message here</p>
            </div>
        </div>
    );
}

export default ForgotPassword;
