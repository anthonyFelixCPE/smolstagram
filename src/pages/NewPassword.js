import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
    getAuth,
    reauthenticateWithCredential,
    updatePassword,
    EmailAuthProvider,
} from "firebase/auth";
import "../styles/NewPassword.css";

function NewPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = location.state?.user || {};
    const fromProfile = location.state?.fromProfile || false;

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async () => {
        if (newPassword !== repeatPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        try {
            const auth = getAuth();
            const currentUser = auth.currentUser;

            if (!currentUser) {
                setErrorMessage(
                    "You need to be logged in to change your password."
                );
                return;
            }

            // Reauthenticate user before changing password
            const credential = EmailAuthProvider.credential(
                currentUser.email,
                currentPassword
            );
            await reauthenticateWithCredential(currentUser, credential);

            // Update password
            await updatePassword(currentUser, newPassword);
            navigate("/profile", { state: { user } });
        } catch (error) {
            console.error("Error updating password:", error);

            // Handle Firebase error messages
            let errorMsg = "Failed to update password. Please try again.";
            if (error.code === "auth/weak-password") {
                errorMsg =
                    "Your new password must be at least 6 characters long.";
            } else if (error.code === "auth/invalid-credential") {
                errorMsg = "Your current password is incorrect.";
            } else if (error.code === "auth/too-many-requests") {
                errorMsg = "Too many incorrect attempts. Try again later.";
            } else if (error.code === "auth/requires-recent-login") {
                errorMsg = "Please log in again before changing your password.";
            }

            setErrorMessage(errorMsg);
        }
    };

    return (
        <div className="newPassword-page">
            <div className="container">
                <button
                    className="back-button"
                    onClick={() =>
                        navigate(fromProfile ? "/profile" : "/login")
                    }
                >
                    Back
                </button>

                <h2>Create a new password</h2>
                <p>Choose a strong password to keep your account secure.</p>

                {fromProfile && (
                    <input
                        type="text"
                        placeholder="Current Password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                    />
                )}

                <input
                    type="text"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Repeat Password"
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    required
                />

                {errorMessage && (
                    <p className="error-message">{errorMessage}</p>
                )}

                <button onClick={handleSubmit}>Submit</button>
            </div>
        </div>
    );
}

export default NewPassword;
