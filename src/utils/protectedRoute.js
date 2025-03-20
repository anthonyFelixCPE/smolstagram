import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const user = localStorage.getItem("user");

    if (user) {
        return <Navigate to="/messenger" />;
    }

    

    return children;
};

export default ProtectedRoute;
