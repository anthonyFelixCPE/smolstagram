import { useEffect } from "react";

const useAutoScroll = (ref, dependency) => {
    useEffect(() => {
        if (ref.current) {
            ref.current.scrollTop = ref.current.scrollHeight;
        }
    }, [dependency]); // Dependency determines when to trigger scrolling
};

export default useAutoScroll;
