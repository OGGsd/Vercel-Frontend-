// Obfuscated backend configuration - hardcoded for security
const BACKEND_PARTS = {
  p: "https://",
  b: "backend",
  d: "axiestudio",
  t: "se"
};

// Construct backend URL from obfuscated parts
const BACKEND_URL = `${BACKEND_PARTS.p}${BACKEND_PARTS.b}.${BACKEND_PARTS.d}.${BACKEND_PARTS.t}`;

export const BASENAME = "";
export const PORT = 3000;
export const PROXY_TARGET = BACKEND_URL;
export const API_ROUTES = ["^/api/v1/", "^/api/v2/", "/health"];
export const BASE_URL_API = `${BACKEND_URL}/api/v1/`;
export const BASE_URL_API_V2 = `${BACKEND_URL}/api/v2/`;
export const HEALTH_CHECK_URL = "/health_check";
export const DOCS_LINK = "https://docs.axiestudio.se";

export default {
  DOCS_LINK,
  BASENAME,
  PORT,
  PROXY_TARGET,
  API_ROUTES,
  BASE_URL_API,
  BASE_URL_API_V2,
  HEALTH_CHECK_URL,
};
