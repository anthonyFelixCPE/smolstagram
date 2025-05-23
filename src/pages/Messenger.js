import React, { useState, useRef, useEffect } from "react";
import "../styles/Messenger.css";
import DisplayPicture from "../images/profilePic.jpg";
import { IoSearchOutline } from "react-icons/io5";
import { HiOutlinePhotograph } from "react-icons/hi";
import { FiSend } from "react-icons/fi";
import { IoCloseCircle } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
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
    deleteDoc,
} from "firebase/firestore";
import useDropdown from "../utils/useDropdown";
import useAutoScroll from "../utils/useAutoScroll";
import useAutoResizeTextarea from "../utils/useAutoResizeTextarea";
import handleLogout from "../utils/handleLogout";
import handleImageUpload from "../utils/handleImageUpload";

function Messenger() {
    const { isDropdownOpen, handleToggleDropdown, dropdownRef } = useDropdown();

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

    const [selectedImages, setSelectedImages] = useState([]);

    const [searchInput, setSearchInput] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const handleConversationClick = async (newConversationId) => {
        if (!selectedConversation) {
            setSelectedConversation(newConversationId);
            return;
        }

        try {
            const messagesRef = collection(
                db,
                `conversations/${selectedConversation}/messages`
            );
            const messagesSnapshot = await getDocs(messagesRef);

            if (messagesSnapshot.empty) {
                // If the conversation has no messages, delete it
                await deleteDoc(doc(db, "conversations", selectedConversation));
                console.log(
                    `Deleted empty conversation: ${selectedConversation}`
                );
            }

            // Set the new conversation
            setSelectedConversation(newConversationId);
        } catch (error) {
            console.error("Error handling conversation switch:", error);
        }
    };

    const handleSearchResultClick = async (selectedUser ) => {
        if (!userData) return;
    
        const userUID = userData.uid;
        const otherUID = selectedUser .id;
    
        try {
            // Check if a conversation already exists
            const conversationsRef = collection(db, "conversations");
            const q = query(
                conversationsRef,
                where("participants", "array-contains", userUID)
            );
    
            const querySnapshot = await getDocs(q);
            let existingConversation = null;
    
            querySnapshot.forEach((docSnap) => {
                const conversationData = docSnap.data();
                if (conversationData.participants.includes(otherUID)) {
                    existingConversation = { id: docSnap.id };
                }
            });
    
            if (existingConversation) {
                // If a conversation exists, select it
                setSelectedConversation(existingConversation.id);
            } else {
                // If no conversation exists, create a new one
                const newConversationRef = await addDoc(conversationsRef, {
                    participants: [userUID, otherUID],
                    lastMessage: "",
                    lastMessageSender: "",
                    lastMessageTimestamp: serverTimestamp(),
                });
    
                setSelectedConversation(newConversationRef.id);
            }
        } catch (error) {
            console.error("Error selecting conversation:", error);
        }
    };

    useEffect(() => {
        if (searchInput.trim() === "") {
            setSearchResults([]);
            return;
        }

        const fetchUsers = async () => {
            try {
                const usersRef = collection(db, "users");
                const querySnapshot = await getDocs(usersRef);
                let filteredUsers = [];

                querySnapshot.forEach((doc) => {
                    const user = doc.data();
                    const fullName = `${user.firstName} ${user.lastName}`;

                    if (
                        user.firstName
                            .toLowerCase()
                            .includes(searchInput.toLowerCase()) ||
                        user.lastName
                            .toLowerCase()
                            .includes(searchInput.toLowerCase()) ||
                        fullName
                            .toLowerCase()
                            .includes(searchInput.toLowerCase())
                    ) {
                        filteredUsers.push({
                            id: doc.id,
                            name: fullName,
                            displayPicture:
                                user.displayPicture || DisplayPicture,
                        });
                    }
                });

                setSearchResults(filteredUsers);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, [searchInput]);

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
        if (
            (!message.trim() && selectedImages.length === 0) ||
            !selectedConversation ||
            !userData
        )
            return;

        const senderID = userData.uid;
        const conversationRef = doc(db, "conversations", selectedConversation);

        try {
            const conversationSnap = await getDoc(conversationRef);
            if (!conversationSnap.exists()) return;

            const conversationData = conversationSnap.data();
            const receiverID = conversationData.participants.find(
                (uid) => uid !== senderID
            );

            const messagesRef = collection(conversationRef, "messages");

            // Send message text if available
            if (message.trim()) {
                await addDoc(messagesRef, {
                    message: message.trim(),
                    senderID,
                    receiverID,
                    timestamp: serverTimestamp(),
                    status: "sent",
                    type: "text",
                });
            }

            // Send images if available
            for (const image of selectedImages) {
                await addDoc(messagesRef, {
                    message: image, // Storing Base64 string
                    senderID,
                    receiverID,
                    timestamp: serverTimestamp(),
                    status: "sent",
                    type: "image",
                });
            }

            // Update last message
            await updateDoc(conversationRef, {
                lastMessage:
                    selectedImages.length > 0 ? "[Image]" : message.trim(),
                lastMessageSender: senderID,
                lastMessageTimestamp: serverTimestamp(),
            });

            setMessage(""); // Clear text input
            setSelectedImages([]); // Clear selected images
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
                        <li
                            onClick={() =>
                                navigate("/profile", {
                                    state: { user: userData },
                                })
                            }
                        >
                            Profile
                        </li>
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
                    <div className="searchbar">
                        <IoSearchOutline />
                        <input
                            className="searchbar-input"
                            type="text"
                            placeholder="Find People"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onBlur={() =>
                                setTimeout(() => setSearchResults([]), 200)
                            }
                        />
                    </div>
                    {searchResults.length > 0 && (
                        <ul className="searchbar-results">
                            {searchResults.map((user) => (
                                <li
                                    key={user.id}
                                    onClick={() =>
                                        handleSearchResultClick(user)
                                    }
                                >
                                    <div className="dp-container">
                                        <img
                                            src={user.displayPicture}
                                            alt="Profile"
                                            className="search-dp"
                                        />
                                    </div>
                                    <p>{user.name}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="conversations-container">
                    {conversations.length > 0 ? (
                        conversations.map((conv) => (
                            <div
                                key={conv.id}
                                className="conversation"
                                onClick={() => handleConversationClick(conv.id)}
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
                                {msg.type === "image" ? (
                                    <img
                                        src={msg.message}
                                        alt="Sent Image"
                                        className="sent-image"
                                        onClick={() => {
                                            const newTab = window.open();
                                            newTab.document.write(
                                                `<img src="${msg.message}"  />`
                                            );
                                        }}
                                        style={{ cursor: "pointer" }}
                                    />
                                ) : (
                                    <p className="message-text">
                                        {msg.message}
                                    </p>
                                )}
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
                <div
                    className="photoPreview-container"
                    style={{
                        display: selectedImages.length > 0 ? "flex" : "none",
                    }}
                >
                    {selectedImages.map((image, index) => (
                        <div key={index} className="image-container">
                            <IoCloseCircle
                                className="removeImage-Icon"
                                onClick={() => {
                                    setSelectedImages(
                                        selectedImages.filter(
                                            (_, i) => i !== index
                                        )
                                    );
                                }}
                            />
                            <img src={image} alt="Selected Preview" />
                        </div>
                    ))}
                </div>
                {selectedConversation && (
                    <div className="send-message-control">
                        <input
                            type="file"
                            accept="image/jpeg, image/png"
                            multiple
                            onChange={(event) =>
                                handleImageUpload(
                                    event,
                                    setSelectedImages,
                                    selectedImages
                                )
                            }
                            id="imageInput"
                            style={{ display: "none" }}
                        />
                        <HiOutlinePhotograph
                            className="icon"
                            onClick={() =>
                                document.getElementById("imageInput").click()
                            }
                        />
                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type a message..."
                        ></textarea>
                        <FiSend className="icon" onClick={handleSendMessage} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Messenger;
