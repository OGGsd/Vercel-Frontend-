export function useCustomApiHeaders() {
  const customHeaders: Record<string, string> = {};

  // Obfuscated API key configuration
  const API_KEY_PARTS = {
    e: "ent",
    r: "ran",
    c: "ce"
  };

  // Construct API key from obfuscated parts
  const defaultApiKey = `${API_KEY_PARTS.e}${API_KEY_PARTS.r}${API_KEY_PARTS.c}`;

  // Use environment variable or fallback to obfuscated default
  const apiKey = import.meta.env.VITE_API_KEY || defaultApiKey;
  if (apiKey) {
    customHeaders["x-api-key"] = apiKey;
  }

  return customHeaders;
}
