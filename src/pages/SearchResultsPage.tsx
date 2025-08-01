"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { tmdbApi } from "../services/tmdbApi"
import { getImageUrl } from "../config/api"
import type { MediaItem } from "../types/mediaTypes"
import "./SearchResultsPage.css"

interface SearchResultsPageProps {
  searchQuery: string
  onBack: () => void
  onMovieClick: (item: MediaItem) => void
}

const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ searchQuery, onBack, onMovieClick }) => {
  const [results, setResults] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeFilter, setActiveFilter] = useState<"all" | "movie" | "tv">("all")
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim()) return

      try {
        setLoading(true)
        setError(null)

        let response: MediaItem[] = []

        if (activeFilter === "all") {
          response = await tmdbApi.searchMulti(searchQuery, page)
        } else if (activeFilter === "movie") {
          const movieResults = await tmdbApi.searchMovies(searchQuery, page)
          response = movieResults.map((movie) => ({ ...movie, media_type: "movie" as const }))
        } else {
          const tvResults = await tmdbApi.searchTVShows(searchQuery, page)
          response = tvResults.map((tv) => ({ ...tv, media_type: "tv" as const }))
        }

        if (page === 1) {
          setResults(response)
        } else {
          setResults((prev) => [...prev, ...response])
        }

        // Estimate total pages
        setTotalPages(Math.min(20, Math.ceil(response.length > 0 ? 500 / 20 : 1)))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to search")
        console.error("Error searching:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [searchQuery, activeFilter, page])

  useEffect(() => {
    // Reset page when switching filters
    setPage(1)
  }, [activeFilter])

  const loadMore = () => {
    if (page < totalPages && !loading) {
      setPage((prev) => prev + 1)
    }
  }

  const handleFilterChange = (filter: "all" | "movie" | "tv") => {
    setActiveFilter(filter)
    setPage(1)
  }

  const filteredResults = results.filter((item) => {
    if (activeFilter === "all") return true
    return item.media_type === activeFilter
  })

  if (loading && page === 1) {
    return (
      <div className="search-results-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Searching for "{searchQuery}"...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="search-results-container">
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="search-results-container">
      <div className="search-header">
        <h1 className="search-title">Search Results</h1>
        <p className="search-subtitle">
          Found {filteredResults.length} results for "{searchQuery}"
        </p>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => handleFilterChange("all")}
        >
          All ({results.length})
        </button>
        <button
          className={`filter-tab ${activeFilter === "movie" ? "active" : ""}`}
          onClick={() => handleFilterChange("movie")}
        >
          Movies ({results.filter((r) => r.media_type === "movie").length})
        </button>
        <button
          className={`filter-tab ${activeFilter === "tv" ? "active" : ""}`}
          onClick={() => handleFilterChange("tv")}
        >
          TV Shows ({results.filter((r) => r.media_type === "tv").length})
        </button>
      </div>

      {filteredResults.length > 0 ? (
        <>
          <div className="search-results-grid">
            {filteredResults.map((item) => (
              <div key={item.id} className="search-result-card" onClick={() => onMovieClick(item)}>
                <div className="result-poster">
                  <img
                    src={getImageUrl(item.poster_path, "w500") || "/placeholder.svg?height=300&width=200"}
                    alt={item.title || item.name}
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=300&width=200"
                    }}
                  />
                  <div className="result-overlay">
                    <button className="play-btn">▶</button>
                  </div>
                  <div className="media-type-badge">{item.media_type === "movie" ? "Movie" : "TV Show"}</div>
                </div>
                <div className="result-info">
                  <h3 className="result-title">{item.title || item.name}</h3>
                  <div className="result-meta">
                    <span className="result-year">
                      {item.release_date
                        ? new Date(item.release_date).getFullYear()
                        : item.first_air_date
                          ? new Date(item.first_air_date).getFullYear()
                          : "N/A"}
                    </span>
                    <span className="result-rating">⭐ {item.vote_average?.toFixed(1) || "N/A"}</span>
                  </div>
                  <p className="result-overview">
                    {item.overview ? item.overview.substring(0, 120) + "..." : "No description available"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredResults.length > 0 && page < totalPages && (
            <div className="load-more-container">
              <button className="load-more-btn" onClick={loadMore} disabled={loading}>
                {loading ? (
                  <>
                    <div className="loading-spinner small"></div>
                    Loading...
                  </>
                ) : (
                  "Load More Results"
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="no-results">
          <div className="no-results-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3>No results found</h3>
          <p>Try searching with different keywords or check your spelling.</p>
          <div className="search-suggestions">
            <p>Suggestions:</p>
            <ul>
              <li>Use more general terms</li>
              <li>Check spelling and try again</li>
              <li>Try searching for actors or directors</li>
            </ul>
          </div>
        </div>
      )}
      {showScrollTop && (
        <button className="scroll-to-top" onClick={scrollToTop}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M18 15L12 9L6 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  )
}

export default SearchResultsPage
