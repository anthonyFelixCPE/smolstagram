import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Messenger from "./pages/Messenger";
import ForgotPassword from "./pages/ForgotPassword";
import NewPassword from "./pages/NewPassword";
import Profile from "./pages/Profile";
import ProtectedRoute from "./utils/protectedRoute";
import RedirectNoLogin from "./utils/redirectNoLogin";

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route index element={<Login />} />
                    <Route
                        path="/login"
                        element={
                            <ProtectedRoute>
                                <Login />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/signup"
                        element={
                            <ProtectedRoute>
                                <Signup />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/messenger" element={<Messenger />} />
                    <Route
                        path="/forgotPassword"
                        element={<ForgotPassword />}
                    />
                    <Route
                        path="/newPassword"
                        element={
                            <RedirectNoLogin>
                                <NewPassword />
                            </RedirectNoLogin>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <RedirectNoLogin>
                                <Profile />
                            </RedirectNoLogin>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
