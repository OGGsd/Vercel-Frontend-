export const getLocalStorage = (key: string) => {
  return localStorage.getItem(key);
};

export const setLocalStorage = (key: string, value: string) => {
  localStorage.setItem(key, value);
};

export const removeLocalStorage = (key: string) => {
  localStorage.removeItem(key);
};

// Session validation utilities
export const isSessionValid = (): boolean => {
  const authTimestamp = getLocalStorage("auth_timestamp");
  if (!authTimestamp) return false;

  const sessionAge = Date.now() - parseInt(authTimestamp);
  const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours

  return sessionAge < maxSessionAge;
};

export const clearExpiredSession = () => {
  if (!isSessionValid()) {
    removeLocalStorage("access_token_lf");
    removeLocalStorage("auth_timestamp");
    removeLocalStorage("refresh_token_lf");
    removeLocalStorage("axie-studio-auth");
  }
};
