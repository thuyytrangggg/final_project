"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import type { Movie, TVShow, MediaItem } from "../types/mediaTypes"
import { tmdbApi } from "../services/tmdbApi"
import { getImageUrl } from "../config/api"
import { ChevronLeft, ChevronRight } from "lucide-react"
import "../styles/RecentlyUpdatedSection.css"

interface RecentlyUpdatedSectionProps {
  onItemClick: (item: MediaItem) => void
}

const RecentlyUpdatedSection: React.FC<RecentlyUpdatedSectionProps> = ({ onItemClick }) => {
  const [recentlyUpdated, setRecentlyUpdated] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const mapToMediaItem = (item: Movie | TVShow): MediaItem => {
    const isMovie = "release_date" in item

    return {
      id: item.id,
      title: isMovie ? (item.original_title ?? item.title ?? "") : (item.original_name ?? item.name ?? ""),
      name: !isMovie ? (item.name ?? "") : "",
      poster_path: item.poster_path ?? undefined,
      backdrop_path: item.backdrop_path ?? undefined,
      vote_average: item.vote_average ?? 0,
      release_date: isMovie ? (item.release_date ?? "") : "",
      first_air_date: !isMovie ? (item.first_air_date ?? "") : "",
      overview: item.overview ?? "",
      genre_ids: item.genre_ids ?? [],
      genres: item.genres ?? [],
      media_type: isMovie ? "movie" : "tv",
      adult: item.adult ?? false,
      original_language: item.original_language ?? "",
      original_title: isMovie ? (item.original_title ?? "") : "",
      original_name: !isMovie ? (item.original_name ?? "") : "",
      popularity: item.popularity ?? 0,
      vote_count: item.vote_count ?? 0,
    }
  }

  const fetchRecentlyUpdated = async () => {
    try {
      setLoading(true)
      setError(null)

      const [movies, tvShows] = await Promise.all([tmdbApi.getMoviesNowPlaying(), tmdbApi.getTVOnTheAir()])

      const combined = [...movies, ...tvShows].map(mapToMediaItem).sort((a, b) => {
        const dateA = new Date(a.release_date || a.first_air_date || "1970-01-01").getTime()
        const dateB = new Date(b.release_date || b.first_air_date || "1970-01-01").getTime()
        return dateB - dateA
      })

      setRecentlyUpdated(combined.slice(0, 15))
    } catch (err) {
      console.error("Error:", err)
      setError("Error fetching recently updated.")
    } finally {
      setLoading(false)
    }
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })

      setTimeout(() => {
        checkScrollability()
      }, 600)
    }
  }

  const getBadgeText = () => "New"

  const getEpisodeInfo = (item: MediaItem) => {
    if (item.media_type === "tv") {
      return "Tập mới"
    }
    return null
  }

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current

      setCanScrollLeft(scrollLeft > 5)

      const maxScrollLeft = scrollWidth - clientWidth
      setCanScrollRight(scrollLeft < maxScrollLeft - 5)
    }
  }

  useEffect(() => {
    fetchRecentlyUpdated()
  }, [])

  useEffect(() => {
    checkScrollability()
  }, [recentlyUpdated])

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScrollability)
      window.addEventListener("resize", checkScrollability)

      return () => {
        scrollContainer.removeEventListener("scroll", checkScrollability)
        window.removeEventListener("resize", checkScrollability)
      }
    }
  }, [])

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      let scrollTimeout: NodeJS.Timeout

      const handleScroll = () => {
        // Clear previous timeout
        clearTimeout(scrollTimeout)

        // Set a new timeout to check scrollability after scrolling stops
        scrollTimeout = setTimeout(() => {
          checkScrollability()
        }, 150) // Reduced timeout for better responsiveness
      }

      // Listen to scroll events (works better with touchpad)
      scrollContainer.addEventListener("scroll", handleScroll)

      // Also listen to scrollend for browsers that support it
      scrollContainer.addEventListener("scrollend", checkScrollability)

      return () => {
        clearTimeout(scrollTimeout)
        scrollContainer.removeEventListener("scroll", handleScroll)
        scrollContainer.removeEventListener("scrollend", checkScrollability)
      }
    }
  }, [])

  if (loading) {
    return (
      <section className="recently-updated-section">
        <h2 className="section-title">Recently Updated</h2>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="recently-updated-section">
        <h2 className="section-title">Recently Updated</h2>
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Try again</button>
        </div>
      </section>
    )
  }

  if (recentlyUpdated.length === 0) {
    return null
  }

  return (
    <section className="recently-updated-section">
      <h2 className="section-title">Recently Updated</h2>
      <div className="recent-container">
        {canScrollLeft && (
          <button className="nav-arrow left-arrow" onClick={() => scroll("left")}>
            <ChevronLeft strokeWidth={3} />
          </button>
        )}
        <div className="recent-items" ref={scrollContainerRef}>
          {recentlyUpdated.map((item) => {
            const badgeText = getBadgeText()
            const episodeInfo = getEpisodeInfo(item)
            return (
              <div key={item.id} className="recent-item" onClick={() => onItemClick(item)}>
                <div className="recent-poster">
                  <img
                    src={getImageUrl(item.poster_path, "w300") || "/placeholder.svg"}
                    alt={item.title}
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=300&width=200"
                    }}
                  />
                  {badgeText && <span className="badge">{badgeText}</span>}

                  {/* Thêm rating vào góc dưới bên trái */}
                  <div className="rating-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                        fill="#FFC107"
                        stroke="#FFC107"
                        strokeWidth="1"
                      />
                    </svg>
                    <span className="rating-value">{item.vote_average ? item.vote_average.toFixed(1) : "8.0"}</span>
                  </div>

                  {/* <div className="recent-overlay">
                    {episodeInfo && (
                      <div className="episode-info">
                        <Volume2 size={16} />
                        <span>Thuyết Minh</span>
                        <span className="episode-text">{episodeInfo}</span>
                      </div>
                    )}
                  </div> */}
                </div>
                <p className="recent-title-below">{item.title}</p>
              </div>
            )
          })}
        </div>
        {canScrollRight && (
          <button className="nav-arrow right-arrow" onClick={() => scroll("right")}>
            <ChevronRight strokeWidth={3} />
          </button>
        )}
      </div>
    </section>
  )
}

export default RecentlyUpdatedSection
