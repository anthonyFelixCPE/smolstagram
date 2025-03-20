import React from "react";
import "../styles/Profile.css";

function Profile() {
    return (
        <div className="profile-page">
            <div className="container">
                <button className="back-button">Back</button>
                <h2>Account Information</h2>
                <p>Manage your account information and keep it accurate.</p>
                <div className="profileImage">
                    <p className="change-photo">Change Photo</p>
                    <img
                        src="https://i.imgur.com/GvsgVco.jpeg"
                        alt="Profile Image"
                    />
                </div>
                <h3 className="account-email">example@gmail.com</h3>
                <div className="info-container">
                    <label>First Name</label>
                    <input type="text" placeholder="First Name"/>
                </div>
                <div className="info-container">
                    <label>Last Name</label>
                    <input type="text" placeholder="Last Name" />
                </div>
                <div className="buttons-container">
                    <button className="change-password">Change Password</button>
                    <button className="edit-profile">Edit Profile</button>
                </div>
            </div>
        </div>
    );
}

export default Profile;
