// Utility functions for user authentication
export const getUserData = () => {
  try {
    const userData = localStorage.getItem("financial_user");
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

export const getUserId = () => {
  const user = getUserData();
  return user?.id || null;
};

export const getUserEmail = () => {
  const user = getUserData();
  return user?.email || null;
};

export const isLoggedIn = () => {
  return getUserData() !== null;
};

export const logout = () => {
  localStorage.removeItem("financial_user");
};
