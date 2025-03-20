import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Logo from "../images/ig icon.png";
import "../styles/Login.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredential.user;

            // Fetch user details from Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (userDoc.exists()) {
                const userData = userDoc.data();
                console.log(
                    `Logged in: ${user.uid} - ${userData.firstName} ${userData.lastName}`
                );

                // Print the password entered by the user
                console.log(`User's Password: ${password}`);

                // Save user details in local storage
                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        uid: user.uid,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        displayPicture: userData.displayPicture,
                        email: user.email,
                    })
                );

                navigate("/messenger");
            } else {
                setMessage("User data not found.");
            }
        } catch (error) {
            setMessage("Login failed. Check your credentials and try again.");
            console.error("Login Error:", error);
        }
    };

    return (
        <div className="login-page">
            <div className="login-page-header">
                <img src={Logo} alt="" />
                <h1>smolstagram</h1>
            </div>
            <div className="content-divider">
                <div className="text-posters">
                    <div className="main-tagline">
                        <h2>
                            Bringing{" "}
                            <span className="bold-text">CONVERSATIONS</span>
                        </h2>
                        <h2>
                            to <span className="bold-text">LIFE</span>.
                        </h2>
                    </div>
                    <p>
                        Bridging the gap between conversations and real
                        connections.
                    </p>
                    <Link to="/signup">
                        <button>Signup</button>
                    </Link>
                </div>
                <div className="input-section">
                    <h2>Login</h2>
                    <div className="input-container">
                        <input
                            type="email"
                            required
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            required
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button onClick={handleLogin}>Login</button>
                        <Link to="/forgotPassword" className="forgot-password">
                            Forgot your password?
                        </Link>
                        <p className="message">{message}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
