const handleImageUpload = (event, setSelectedImages, selectedImages) => {
    const files = event.target.files;
    if (files.length > 0) {
        const imagesArray = [];
        let oversizedFiles = false;

        Array.from(files).forEach((file) => {
            if (file.size > 1024 * 1024) {
                oversizedFiles = true;
            } else if (
                file.type === "image/jpeg" ||
                file.type === "image/png"
            ) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    imagesArray.push(reader.result);
                    setSelectedImages([...selectedImages, ...imagesArray]);
                };
                reader.readAsDataURL(file);
            }
        });

        if (oversizedFiles) {
            alert("One or more images exceed 1MB and will not be uploaded.");
        }
    }
};

export default handleImageUpload;
