 function generateRandomImageName() {
    const timestamp = new Date().getTime(); // Get current timestamp
    const randomString = Math.random().toString(36).substring(7); // Generate random string
    return `${timestamp}_${randomString}.jpg`; // Combine timestamp and random string
}
export {generateRandomImageName}