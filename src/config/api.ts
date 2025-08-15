export const API_CONFIG = {
  BASE_URL: "https://api.themoviedb.org/3",
  API_KEY: import.meta.env.VITE_TMDB_API_KEY,
  IMAGE_BASE_URL: "https://image.tmdb.org/t/p/",
}

export const getImageUrl = (path: string | undefined | null, size = "original"): string => {
  if (!path) {
    return "/placeholder.svg?height=300&width=200"
  }
  return `${API_CONFIG.IMAGE_BASE_URL}${size}${path}`
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatRuntime = (minutes: number): string => {
  if (!minutes && minutes !== 0) return "N/A";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};
