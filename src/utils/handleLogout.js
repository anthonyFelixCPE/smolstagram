import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";

const handleLogout = async (userData, navigate, setUserData) => {
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

export default handleLogout;
