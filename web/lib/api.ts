const getApiUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};
const API_URL = getApiUrl();

export async function apiRequest(
  endpoint: string,
  token: string,
  options: RequestInit = {}
) {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || data?.error || "Something went wrong"
    );
  }

  return data;
}