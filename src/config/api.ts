export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_TMDB_BASE_URL,
  IMAGE_BASE_URL: import.meta.env.VITE_TMDB_IMAGE_BASE_URL,
  API_KEY: import.meta.env.VITE_TMDB_API_KEY,
  IMAGE_SIZES: {
    poster: "w500",
    backdrop: "w1280",
    profile: "w185",
  },
}

export const getImageUrl = (path: string | null | undefined, size = "w500"): string => {
  if (!path) return "/placeholder.svg?height=300&width=200"
  return `${API_CONFIG.IMAGE_BASE_URL}/${size}${path}`
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.getFullYear().toString()
}


export const formatRuntime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  const seconds = 0 

  const pad = (num: number) => String(num).padStart(2, '0')

  return `${hours}:${pad(mins)}:${pad(seconds)}`
}

