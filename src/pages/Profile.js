import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../config/firebase"; // Import Firestore
import { doc, updateDoc } from "firebase/firestore";
import "../styles/Profile.css";

function Profile() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = location.state?.user || {}; // Retrieve user data from navigation state

    // State for managing user data
    const [isEditing, setIsEditing] = useState(false);
    const [firstName, setFirstName] = useState(user.firstName || "");
    const [lastName, setLastName] = useState(user.lastName || "");
    const [profilePic, setProfilePic] = useState(
        user.displayPicture || "https://i.imgur.com/GvsgVco.jpeg"
    );
    const [newProfilePic, setNewProfilePic] = useState(null); // Stores new image temporarily

    // Convert image file to Base64
    const handleProfilePictureChange = (event) => {
        if (!isEditing) return; // Allow changing the picture only when editing

        const file = event.target.files[0];

        if (!file) return;
        if (!file.type.startsWith("image/")) {
            alert("Only image files are allowed.");
            return;
        }
        if (file.size > 1024 * 1024) {
            alert("File size must be less than 1MB.");
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => {
            setNewProfilePic(reader.result); // Show preview without saving yet
        };

        reader.onerror = () => {
            alert("Failed to read file. Please try another image.");
        };
    };

    // Save changes to Firestore
    const handleSaveChanges = async () => {
        try {
            const userDocRef = doc(db, "users", user.uid);
            const updatedData = {
                firstName,
                lastName,
                displayPicture: newProfilePic || profilePic, // Save new image if available
            };

            await updateDoc(userDocRef, updatedData);

            // Update UI and local storage
            setProfilePic(newProfilePic || profilePic);
            setNewProfilePic(null);
            setIsEditing(false);

            const updatedUser = { ...user, ...updatedData };
            localStorage.setItem("user", JSON.stringify(updatedUser));

        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile. Try again.");
        }
    };

    // Cancel changes and restore previous state
    const handleCancelChanges = () => {
        setFirstName(user.firstName || "");
        setLastName(user.lastName || "");
        setNewProfilePic(null);
        setIsEditing(false);
    };

    return (
        <div className="profile-page">
            <div className="container">
                <button
                    className="back-button"
                    onClick={() => navigate("/messenger")}
                >
                    Back
                </button>
                <h2>Account Information</h2>
                <p>Manage your account information and keep it accurate.</p>

                <div className="profileImage">
                    {isEditing && (
                        <label className="change-photo" htmlFor="fileInput">
                            Change Photo
                        </label>
                    )}
                    {isEditing && (
                        <input
                            type="file"
                            id="fileInput"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleProfilePictureChange}
                        />
                    )}
                    <img src={newProfilePic || profilePic} alt="Profile" />
                </div>

                <h3 className="account-email">
                    {user.email || "No Email Found"}
                </h3>

                <div className="info-container">
                    <label>First Name</label>
                    <input
                        type="text"
                        value={firstName}
                        readOnly={!isEditing}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </div>

                <div className="info-container">
                    <label>Last Name</label>
                    <input
                        type="text"
                        value={lastName}
                        readOnly={!isEditing}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </div>

                <div className="buttons-container">
                    {isEditing ? (
                        <>
                            <button
                                className="cancel-changes"
                                onClick={handleCancelChanges}
                            >
                                Cancel Changes
                            </button>
                            <button
                                className="save-changes"
                                onClick={handleSaveChanges}
                            >
                                Save Changes
                            </button>
                        </>
                    ) : (
                        <button className="change-password">
                            Change Password
                        </button>
                    )}
                    {!isEditing && (
                        <button
                            className="edit-profile"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;
