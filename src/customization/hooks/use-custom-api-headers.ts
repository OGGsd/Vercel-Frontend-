export function useCustomApiHeaders() {
  const customHeaders: Record<string, string> = {};

  // Add API key from environment if available
  const apiKey = import.meta.env.VITE_API_KEY;
  if (apiKey) {
    customHeaders["x-api-key"] = apiKey;
  }

  return customHeaders;
}
