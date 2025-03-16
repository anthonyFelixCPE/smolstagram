import { useEffect } from "react";

const useAutoResizeTextarea = (textareaRef, value) => {
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"; // Reset height
            let newHeight = Math.min(
                textareaRef.current.scrollHeight,
                window.innerHeight * 0.2 // Limit height to 20vh
            );
            textareaRef.current.style.height = `${newHeight}px`;
        }
    }, [value]); // Trigger effect when value changes
};

export default useAutoResizeTextarea;
