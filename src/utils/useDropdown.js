import { useState, useRef, useEffect } from "react";

const useDropdown = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

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

    return { isDropdownOpen, handleToggleDropdown, dropdownRef };
};

export default useDropdown;
