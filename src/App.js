import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Messenger from "./pages/Messenger";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route index element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/messenger" element={<Messenger />} />
                    <Route path="/forgotPassword" element={<ForgotPassword />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
