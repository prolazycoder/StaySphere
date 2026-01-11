/**
 * Clears user session data from localStorage.
 * This should be called before redirecting the user to the login page.
 */
export const logoutUser = () => {
    console.log("authUtils: logoutUser called. Clearing localStorage.");
    localStorage.clear();
    window.location.href = "/"; // Force full reload to login page
};
