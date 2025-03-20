import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import "../styles/ForgotPassword.css";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [emailSent, setEmailSent] = useState(false);
    const navigate = useNavigate();

    // Handle sending reset password link
    const handleSendResetLink = async () => {
        if (!email) {
            setMessage("Please enter a valid email.");
            return;
        }

        try {
            // Check if the email exists in Firestore
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", email));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setMessage("This email is not registered.");
                return;
            }

            // Send password reset email
            await sendPasswordResetEmail(auth, email);
            setEmailSent(true);
            setMessage("Check your email for the password reset link.");
        } catch (error) {
            console.error("Error sending reset password email:", error);
            setMessage(
                "Failed to send reset password email. Please try again."
            );
        }
    };

    return (
        <div className="forgotPassword-page">
            <div className="container enter-email">
                <button className="back-button" onClick={() => navigate(-1)}>
                    Back
                </button>
                <h2>Recover your account</h2>
                <p>
                    Enter your email below, and we'll send you a link to reset
                    your password.
                </p>
                <input
                    type="email"
                    placeholder="Please enter your account email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={emailSent} // Disable input after sending
                />
                <button
                    className="submit-button"
                    onClick={handleSendResetLink}
                    disabled={emailSent}
                >
                    {emailSent ? "Link Sent" : "Send Reset Password Link"}
                </button>
                <p className="message">{message}</p>
            </div>
        </div>
    );
}

export default ForgotPassword;
