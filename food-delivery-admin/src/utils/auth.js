// authUtils.js
export const TokenManager = {
  setToken: (token) => {
    if (!token) {
      console.error("Attempted to store undefined/null token");
      return;
    }
    localStorage.setItem("token", token);
    sessionStorage.setItem("token_backup", token);
  },

  getToken: () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token_backup");
    console.log("Retrieved token:", token ? "exists" : "missing");
    return token;
  },

  clearTokens: () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token_backup");
    console.log("All tokens cleared");
  },
};
