import { useEffect } from "react";
import {
  IS_AUTO_LOGIN,
  LANGFLOW_ACCESS_TOKEN_EXPIRE_SECONDS,
  LANGFLOW_ACCESS_TOKEN_EXPIRE_SECONDS_ENV,
} from "@/constants/constants";
import { useRefreshAccessToken } from "@/controllers/API/queries/auth";
import { CustomNavigate } from "@/customization/components/custom-navigate";
import useAuthStore from "@/stores/authStore";
import { isSessionValid, clearExpiredSession } from "@/utils/local-storage-util";

export const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { mutate: mutateRefresh } = useRefreshAccessToken();
  const autoLogin = useAuthStore((state) => state.autoLogin);
  const isAutoLoginEnv = IS_AUTO_LOGIN;
  const testMockAutoLogin = sessionStorage.getItem("testMockAutoLogin");

  const shouldRedirect =
    !isAuthenticated &&
    autoLogin !== undefined &&
    (!autoLogin || !isAutoLoginEnv);

  useEffect(() => {
    // Clear expired sessions on mount
    clearExpiredSession();

    // Only set up refresh interval if session is valid and user is authenticated
    if (isAuthenticated && isSessionValid()) {
      // Much longer refresh interval - only refresh every 23 hours
      const refreshInterval = 23 * 60 * 60 * 1000; // 23 hours

      const intervalFunction = () => {
        // Only refresh if session is still valid
        if (isSessionValid()) {
          mutateRefresh();
        }
      };

      // Only set up refresh for manual login users
      if (autoLogin !== undefined && !autoLogin) {
        const intervalId = setInterval(intervalFunction, refreshInterval);
        return () => clearInterval(intervalId);
      }
    }
  }, [isAuthenticated, autoLogin]);

  if (shouldRedirect || testMockAutoLogin) {
    const currentPath = window.location.pathname + window.location.search;
    const isHomePath = window.location.pathname === "/" || window.location.pathname === "/flows";
    const isLoginPage = window.location.pathname.includes("login");
    const isSignupPage = window.location.pathname.includes("signup");

    // Don't redirect if already on login/signup pages
    if (isLoginPage || isSignupPage) {
      return children;
    }

    return (
      <CustomNavigate
        to={
          "/login" +
          (!isHomePath ? "?redirect=" + encodeURIComponent(currentPath) : "")
        }
        replace
      />
    );
  } else {
    return children;
  }
};
