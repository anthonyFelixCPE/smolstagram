import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Signup.css";
import { auth, db } from "../config/firebase";
import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function Signup() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async () => {
        const { firstName, lastName, email, password, confirmPassword } =
            formData;

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        try {
            // Create user with email & password
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredential.user;

            console.log("New User UID (Before Logout):", user.uid);

            // Send email verification
            await sendEmailVerification(user);
            setMessage(
                "Verification email sent. Please check your inbox and verify your email before logging in."
            );

            // Log out user immediately after signing up
            await signOut(auth);

            console.log(
                "Current Logged-in User (After Logout):",
                auth.currentUser?.uid || "No user logged in"
            );

            // Default profile picture URL (Replace with a direct link)
            const defaultProfilePicture = "https://i.imgur.com/LBqsLCj.jpg";

            // Wait for email verification before storing in Firestore
            const checkEmailVerified = setInterval(async () => {
                await user.reload();
                if (user.emailVerified) {
                    clearInterval(checkEmailVerified);

                    // Save user details to Firestore
                    await setDoc(doc(db, "users", user.uid), {
                        firstName,
                        lastName,
                        email,
                        displayPicture: defaultProfilePicture,
                    });

                    setMessage("Signup successful! You can now log in.");

                    // Clear input fields after successful signup
                    setFormData({
                        firstName: "",
                        lastName: "",
                        email: "",
                        password: "",
                        confirmPassword: "",
                    });
                }
            }, 3000);
        } catch (error) {
            // Handle Firebase errors with proper messages
            if (error.code === "auth/email-already-in-use") {
                setMessage(
                    "This email is already registered. Please use a different email."
                );
            } else if (error.code === "auth/weak-password") {
                setMessage("Password should be at least 6 characters.");
            } else if (error.code === "auth/invalid-email") {
                setMessage("Invalid email format. Please enter a valid email.");
            } else {
                setMessage("Signup failed. Please try again.");
            }

            console.error("Signup Error:", error);
        }
    };

    return (
        <div className="signup-page">
            <div className="container">
                <div className="container-header">
                    <h1>smolstagram</h1>
                    <p>Where Conversations Begin - Get Started Today!</p>
                </div>
                <div className="input-container">
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        required
                        placeholder="First Name"
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        required
                        placeholder="Last Name"
                        onChange={handleChange}
                    />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        required
                        placeholder="Email"
                        onChange={handleChange}
                    />
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        required
                        placeholder="Password"
                        onChange={handleChange}
                    />
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        required
                        placeholder="Repeat Password"
                        onChange={handleChange}
                    />
                    <p>
                        By signing up, you agree to our Terms and Privacy Policy
                    </p>
                    <button onClick={handleSignup}>Sign up</button>
                    <p className="message">{message}</p>
                </div>
            </div>
            <div className="login-redirect">
                <h4>
                    Have an account? <Link to="/login">Login</Link>
                </h4>
            </div>
        </div>
    );
}
