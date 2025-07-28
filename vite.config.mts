import react from "@vitejs/plugin-react-swc";
import * as dotenv from "dotenv";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const envLangflowResult = dotenv.config({
    path: path.resolve(__dirname, "../../.env"),
  });

  const envLangflow = envLangflowResult.parsed || {};

  // Configuration constants
  const API_ROUTES = ["^/api/v1/", "^/api/v2/", "/health"];
  const BASENAME = "";
  const PORT = 3000;
  const PROXY_TARGET = env.VITE_BACKEND_URL || "https://backend.axiestudio.se";

  const apiRoutes = API_ROUTES;
  const target = env.VITE_PROXY_TARGET || PROXY_TARGET;
  const port = Number(env.VITE_PORT) || PORT;

  const proxyTargets = apiRoutes.reduce((proxyObj, route) => {
    proxyObj[route] = {
      target: target,
      changeOrigin: true,
      secure: false,
      ws: true,
    };
    return proxyObj;
  }, {});

  return {
    base: BASENAME || "",
    build: {
      outDir: "dist",
      // Production security enhancements
      sourcemap: mode === 'development', // Only generate sourcemaps in development
      minify: mode === 'production', // Use default minification in production
    },
    define: {
      "process.env.BACKEND_URL": JSON.stringify(
        envLangflow.BACKEND_URL ?? "http://localhost:7860",
      ),
      "process.env.ACCESS_TOKEN_EXPIRE_SECONDS": JSON.stringify(
        envLangflow.ACCESS_TOKEN_EXPIRE_SECONDS ?? 60,
      ),
      "process.env.CI": JSON.stringify(envLangflow.CI ?? false),
      "process.env.LANGFLOW_AUTO_LOGIN": JSON.stringify(
        envLangflow.LANGFLOW_AUTO_LOGIN ?? true,
      ),
      "process.env.LANGFLOW_FEATURE_MCP_COMPOSER": JSON.stringify(
        envLangflow.LANGFLOW_FEATURE_MCP_COMPOSER ?? "false",
      ),
      // Security-related environment variables
      "process.env.REACT_APP_DISABLE_CONSOLE_LOGS": JSON.stringify(
        mode === 'production' ? 'true' : 'false'
      ),
      "process.env.REACT_APP_SECURITY_MODE": JSON.stringify(
        mode === 'production' ? 'strict' : 'development'
      ),
    },
    plugins: [react(), svgr(), tsconfigPaths()],
    server: {
      port: port,
      proxy: {
        ...proxyTargets,
      },
    },
  };
});
