// authStore.js

import { Cookies } from "react-cookie";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LANGFLOW_ACCESS_TOKEN } from "@/constants/constants";
import type { AuthStoreType } from "@/types/zustand/auth";
import { getLocalStorage } from "@/utils/local-storage-util";

const cookies = new Cookies();

// Get token from localStorage first, then cookies for better persistence
const getStoredToken = () => {
  return getLocalStorage(LANGFLOW_ACCESS_TOKEN) || cookies.get(LANGFLOW_ACCESS_TOKEN) || null;
};

const useAuthStore = create<AuthStoreType>()(
  persist(
    (set, get) => ({
      isAdmin: false,
      isAuthenticated: !!getStoredToken(),
      accessToken: getStoredToken(),
      userData: null,
      autoLogin: null,
      apiKey: cookies.get("apikey_tkn_lflw"),
      authenticationErrorCount: 0,

  setIsAdmin: (isAdmin) => set({ isAdmin }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setUserData: (userData) => set({ userData }),
  setAutoLogin: (autoLogin) => set({ autoLogin }),
  setApiKey: (apiKey) => set({ apiKey }),
  setAuthenticationErrorCount: (authenticationErrorCount) =>
    set({ authenticationErrorCount }),

      logout: async () => {
        // Clear all storage
        localStorage.removeItem(LANGFLOW_ACCESS_TOKEN);
        localStorage.removeItem("apikey_tkn_lflw");
        cookies.remove(LANGFLOW_ACCESS_TOKEN, { path: "/" });
        cookies.remove("apikey_tkn_lflw", { path: "/" });
        cookies.remove("refresh_token_lf", { path: "/" });

        set({
          isAdmin: false,
          userData: null,
          accessToken: null,
          isAuthenticated: false,
          autoLogin: false,
          apiKey: null,
          authenticationErrorCount: 0,
        });
      },
    }),
    {
      name: "axie-studio-auth", // Unique name for localStorage
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        userData: state.userData,
        isAdmin: state.isAdmin,
        apiKey: state.apiKey,
      }),
    }
  )
);

export default useAuthStore;
