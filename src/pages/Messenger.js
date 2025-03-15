import React, { useState, useRef, useEffect } from "react";
import "../styles/Messenger.css";
import DisplayPicture from "../images/profilePic.jpg";
import { IoSearchOutline } from "react-icons/io5";
import { HiOutlinePhotograph } from "react-icons/hi";
import { FiSend } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";
import { signOut } from "firebase/auth";
import { db } from "../config/firebase";
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
} from "firebase/firestore";

function Messenger() {
    const [selectedTab, setSelectedTab] = useState("chats-opt");
    const [message, setMessage] = useState("");
    const textareaRef = useRef(null);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);

    const [conversations, setConversations] = useState([]);

    // Adjust textarea height dynamically
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"; // Reset height
            let newHeight = Math.min(
                textareaRef.current.scrollHeight,
                window.innerHeight * 0.2
            ); // Limit to 20vh
            textareaRef.current.style.height = `${newHeight}px`;
        }
    }, [message]);

    // Toggle dropdown when clicking on dp-container
    const handleToggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
    };

    // Close dropdown if clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUserData(parsedUser);

            // Debugging print
            console.log(
                `Logged in: ${parsedUser.uid} - ${parsedUser.firstName} ${parsedUser.lastName}`
            );
        } else {
            navigate("/login");
        }
    }, [navigate]);

    const handleLogout = async () => {
        if (userData) {
            console.log(
                `Logging out: ${userData.uid} - ${userData.firstName} ${userData.lastName}`
            );
        }
        await signOut(auth);

        // Debugging print to confirm logout
        console.log(
            "Current logged-in user:",
            auth.currentUser?.uid || "No user logged in"
        );

        localStorage.removeItem("user");
        setUserData(null);
        navigate("/login");
    };

    const fetchConversations = async () => {
        if (!userData) return;

        const userUID = userData.uid;
        const conversationsRef = collection(db, "conversations");

        const q = query(
            conversationsRef,
            where("participants", "array-contains", userUID)
        );
        const querySnapshot = await getDocs(q);

        let conversationsList = [];

        for (let docSnap of querySnapshot.docs) {
            const conversationData = docSnap.data();
            const otherUID = conversationData.participants.find(
                (uid) => uid !== userUID
            );

            if (!otherUID) continue;

            const userRef = doc(db, "users", otherUID);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userInfo = userSnap.data();

                let lastMessage = conversationData.lastMessage;
                if (conversationData.lastMessageSender === userUID) {
                    lastMessage = `You: ${lastMessage}`;
                }

                conversationsList.push({
                    id: docSnap.id,
                    name: `${userInfo.firstName} ${userInfo.lastName}`,
                    lastMessage: lastMessage,
                    lastMessageTimestamp: conversationData.lastMessageTimestamp,
                    displayPicture: userInfo.displayPicture || DisplayPicture,
                });
            }
        }

        conversationsList.sort(
            (a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp
        );
        setConversations(conversationsList);
    };

    useEffect(() => {
        if (userData) {
            fetchConversations();
        }
    }, [userData]);

    return (
        <div className="messenger-page">
            <div className="side-bar">
                <div
                    className="dp-name-container"
                    ref={dropdownRef}
                    onClick={handleToggleDropdown}
                >
                    <div className="dp-container">
                        <img src={userData?.displayPicture} alt="Profile" />
                    </div>
                    <ul
                        className="dropdown"
                        style={{ display: isDropdownOpen ? "block" : "none" }}
                    >
                        <li>Profile</li>
                        <li onClick={handleLogout}>Logout</li>
                    </ul>
                    <h3 className="loggedIn-userName">
                        {userData
                            ? `${userData.firstName} ${userData.lastName}`
                            : "Loading..."}
                    </h3>
                </div>
                <div className="searchbar-container">
                    <IoSearchOutline />
                    <input
                        className="searchbar"
                        type="text"
                        placeholder="Find People"
                    />
                </div>
                <div className="chats-people-container">
                    <p
                        className={
                            selectedTab === "chats-opt" ? "selected" : ""
                        }
                        onClick={() => setSelectedTab("chats-opt")}
                    >
                        Chats
                    </p>
                    <p
                        className={
                            selectedTab === "people-opt" ? "selected" : ""
                        }
                        onClick={() => setSelectedTab("people-opt")}
                    >
                        People
                    </p>
                </div>
                <div className="conversations-container">
                    {conversations.length > 0 ? (
                        conversations.map((conv) => (
                            <div key={conv.id} className="conversation">
                                <div className="conversation-dp-container">
                                    <img
                                        src={conv.displayPicture}
                                        alt="Profile"
                                    />
                                </div>
                                <div className="name-lastMessage">
                                    <h4 className="sender-name">{conv.name}</h4>
                                    <p className="last-message">
                                        {conv.lastMessage.length > 25
                                            ? `${conv.lastMessage.substring(
                                                  0,
                                                  25
                                              )}...`
                                            : conv.lastMessage}
                                    </p>
                                </div>
                                <p className="last-message-time">
                                    {new Date(
                                        conv.lastMessageTimestamp.toDate()
                                    ).toLocaleTimeString()}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p>No conversations yet.</p>
                    )}
                </div>
            </div>
            <div className="main-content">
                <div className="conversation-header">
                    <div className="dp-container">
                        <img src={DisplayPicture} />
                    </div>
                    <h4>My Baby</h4>
                </div>
                <div className="chat-box">
                    <div className="message sender">
                        <div className="dp-container">
                            <img src={DisplayPicture} />
                        </div>
                        <div className="message-content">
                            <p className="message-text">
                                I love you so much babyyy, I miss you vvvv
                                muchhhh.
                            </p>
                            <p className="time-sent">03:00 AM</p>
                        </div>
                    </div>
                    <div className="message receiver">
                        <div className="dp-container">
                            <img src={DisplayPicture} />
                        </div>
                        <div className="message-content">
                            <p className="message-text">
                                I love you more babyy, I miss you toooo
                            </p>
                            <p className="time-sent">03:00 AM</p>
                        </div>
                    </div>
                </div>
                <div className="send-message-control">
                    <HiOutlinePhotograph className="icon" />
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                    ></textarea>
                    <FiSend className="icon" />
                </div>
            </div>
        </div>
    );
}

export default Messenger;
