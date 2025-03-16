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
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";
import useDropdown from "../utils/useDropdown";
import useAutoScroll from "../utils/useAutoScroll";
import useAutoResizeTextarea from "../utils/useAutoResizeTextarea";
import handleLogout from "../utils/handleLogout";

function Messenger() {
    const { isDropdownOpen, handleToggleDropdown, dropdownRef } = useDropdown();

    const [selectedTab, setSelectedTab] = useState("chats-opt");
    const [message, setMessage] = useState("");
    const textareaRef = useRef(null);
    const chatBoxRef = useRef(null);

    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);

    const [conversations, setConversations] = useState([]);

    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);

    const [otherUserInfo, setOtherUserInfo] = useState(null);
    useAutoScroll(chatBoxRef, messages);
    useAutoResizeTextarea(textareaRef, message);

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

    useEffect(() => {
        if (!userData) return;
        const userUID = userData.uid;
        const conversationsRef = collection(db, "conversations");
        const q = query(
            conversationsRef,
            where("participants", "array-contains", userUID)
        );

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
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
                        lastMessageTimestamp:
                            conversationData.lastMessageTimestamp,
                        displayPicture:
                            userInfo.displayPicture || DisplayPicture,
                    });
                }
            }
            conversationsList.sort(
                (a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp
            );
            setConversations(conversationsList);
        });
        return () => unsubscribe();
    }, [userData]);

    useEffect(() => {
        if (!selectedConversation || !userData) return; // Prevents running when userData is null

        const fetchMessagesAndUserInfo = async () => {
            const messagesRef = collection(
                db,
                `conversations/${selectedConversation}/messages`
            );
            const q = query(messagesRef, orderBy("timestamp", "asc"));

            // Fetch messages
            const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
                let messagesList = [];
                querySnapshot.forEach((doc) => {
                    messagesList.push(doc.data());
                });
                setMessages(messagesList);
            });

            // Fetch other user's info
            const conversationDoc = await getDoc(
                doc(db, "conversations", selectedConversation)
            );
            if (conversationDoc.exists() && userData) {
                // Ensure userData exists
                const conversationData = conversationDoc.data();
                const otherUID = conversationData.participants.find(
                    (uid) => uid !== userData.uid
                );

                if (otherUID) {
                    const userRef = doc(db, "users", otherUID);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        setOtherUserInfo(userSnap.data());
                    }
                }
            }
            return () => unsubscribeMessages();
        };

        fetchMessagesAndUserInfo();
    }, [selectedConversation, userData]);

    const handleSendMessage = async () => {
        if (!message.trim() || !selectedConversation || !userData) return;

        const senderID = userData.uid;
        const conversationRef = doc(db, "conversations", selectedConversation);

        try {
            // Fetch conversation details to determine receiverID
            const conversationSnap = await getDoc(conversationRef);
            if (!conversationSnap.exists()) return;

            const conversationData = conversationSnap.data();
            const receiverID = conversationData.participants.find(
                (uid) => uid !== senderID
            );

            // Reference to messages subcollection
            const messagesRef = collection(conversationRef, "messages");

            // Add message to Firestore
            await addDoc(messagesRef, {
                message: message.trim(),
                senderID,
                receiverID,
                timestamp: serverTimestamp(),
                status: "sent",
            });

            // Update conversation with last message details
            await updateDoc(conversationRef, {
                lastMessage: message.trim(),
                lastMessageSender: senderID,
                lastMessageTimestamp: serverTimestamp(),
            });

            setMessage(""); // Clear input field
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // Allow sending with Enter key
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

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
                        <li
                            onClick={() =>
                                handleLogout(userData, navigate, setUserData)
                            }
                        >
                            Logout
                        </li>
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
                            <div
                                key={conv.id}
                                className="conversation"
                                onClick={() => setSelectedConversation(conv.id)}
                            >
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
                                    {conv.lastMessageTimestamp
                                        ? new Date(
                                              conv.lastMessageTimestamp.toDate()
                                          ).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                              hour12: true,
                                          })
                                        : ""}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p>No conversations yet.</p>
                    )}
                </div>
            </div>
            <div className="main-content">
                {selectedConversation && (
                    <div className="conversation-header">
                        <div className="dp-container">
                            <img
                                src={otherUserInfo?.displayPicture}
                                alt="Profile"
                            />
                        </div>
                        <h4>
                            {otherUserInfo
                                ? `${otherUserInfo.firstName} ${otherUserInfo.lastName}`
                                : "Select a conversation"}
                        </h4>
                    </div>
                )}
                <div className="chat-box" ref={chatBoxRef}>
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={
                                msg.senderID === userData?.uid
                                    ? "message receiver"
                                    : "message sender"
                            }
                        >
                            <div className="dp-container">
                                <img
                                    src={
                                        msg.senderID === userData?.uid
                                            ? userData.displayPicture
                                            : otherUserInfo?.displayPicture ||
                                              DisplayPicture
                                    }
                                    alt="Profile"
                                />
                            </div>
                            <div className="message-content">
                                <p className="message-text">{msg.message}</p>
                                <p className="time-sent">
                                    {msg.timestamp
                                        ? new Date(
                                              msg.timestamp.toDate()
                                          ).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                              hour12: true,
                                          })
                                        : ""}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="send-message-control">
                    <HiOutlinePhotograph className="icon" />
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyPress} // Allow Enter key to send
                        placeholder="Type a message..."
                    ></textarea>
                    <FiSend className="icon" onClick={handleSendMessage} />
                </div>
            </div>
        </div>
    );
}

export default Messenger;
