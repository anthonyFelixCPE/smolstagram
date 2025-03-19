import React from "react";
import "../styles/NewPassword.css";

function NewPassword() {
    return (
        <div className="newPassword-page">
            <div className="container">
                <h2>Create a new password</h2>
                <p>Choose a strong password to keep your account secure.</p>
                <input type="password" placeholder="Password" required />
                <input type="password" placeholder="Repeat Password" required />
                <button>Submit</button>
            </div>
        </div>
    );
}

export default NewPassword;
