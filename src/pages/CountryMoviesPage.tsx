"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { tmdbApi } from "../services/tmdbApi"
import { getImageUrl } from "../config/api"
import type { Movie, TVShow } from "../types/mediaTypes"
import "./CountryMoviesPage.css"

interface Country {
  iso_3166_1: string
  english_name: string
  native_name: string
}

interface CountryMoviesPageProps {
  selectedCountry: Country
  onBack: () => void
  onMovieClick?: (movieData: any) => void
}

const CountryMoviesPage: React.FC<CountryMoviesPageProps> = ({ selectedCountry, onBack, onMovieClick }) => {
  const [movies, setMovies] = useState<Movie[]>([])
  const [tvShows, setTvShows] = useState<TVShow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"movies" | "tv">("movies")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)
        setError(null)

        const [movieResults, tvResults] = await Promise.all([
          tmdbApi.discoverMoviesByCountry(selectedCountry.iso_3166_1, page),
          tmdbApi.discoverTVShowsByCountry(selectedCountry.iso_3166_1, page),
        ])

        if (page === 1) {
          setMovies(movieResults)
          setTvShows(tvResults)
        } else {
          if (activeTab === "movies") {
            setMovies((prev) => [...prev, ...movieResults])
          } else {
            setTvShows((prev) => [...prev, ...tvResults])
          }
        }

        setTotalPages(Math.min(20, Math.ceil(movieResults.length > 0 || tvResults.length > 0 ? 500 / 20 : 1)))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch content")
        console.error("Error fetching content:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [selectedCountry.iso_3166_1, page])

  useEffect(() => {
    setPage(1)
  }, [activeTab])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const loadMore = () => {
    if (page < totalPages && !loading) {
      setPage((prev) => prev + 1)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleContentClick = (item: Movie | TVShow) => {
    if (onMovieClick) {
      const mediaItem = {
        ...item,
        media_type: activeTab === "movies" ? ("movie" as const) : ("tv" as const),
        title: activeTab === "movies" ? (item as Movie).title : undefined,
        name: activeTab === "tv" ? (item as TVShow).name : undefined,
        release_date: activeTab === "movies" ? (item as Movie).release_date : undefined,
        first_air_date: activeTab === "tv" ? (item as TVShow).first_air_date : undefined,
      }
      onMovieClick(mediaItem)
    }
  }

  const currentContent = activeTab === "movies" ? movies : tvShows

  if (loading && page === 1) {
    return (
      <div className="country-movies-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading {selectedCountry.native_name} content...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="country-movies-container">
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="country-movies-container">
      <div className="country-header">
        <h1 className="country-title">{selectedCountry.native_name} Content</h1>
        <p className="country-subtitle">Discover the best content from {selectedCountry.english_name}</p>
      </div>

      <div className="content-tabs">
        <button
          className={`tab-button ${activeTab === "movies" ? "active" : ""}`}
          onClick={() => setActiveTab("movies")}
        >
          Movies ({movies.length})
        </button>
        <button className={`tab-button ${activeTab === "tv" ? "active" : ""}`} onClick={() => setActiveTab("tv")}>
          TV Shows ({tvShows.length})
        </button>
      </div>

      <div className="content-grid">
        {currentContent.map((item) => (
          <div key={item.id} className="content-card" onClick={() => handleContentClick(item)}>
            <div className="content-poster">
              <img
                src={getImageUrl(item.poster_path, "w500") || "/placeholder.svg?height=300&width=200"}
                alt={activeTab === "movies" ? (item as Movie).title : (item as TVShow).name}
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=300&width=200"
                }}
              />
              <div className="content-overlay">
                <button className="play-btn">▶</button>
              </div>
            </div>
            <div className="content-info">
              <h3 className="content-title">
                {activeTab === "movies" ? (item as Movie).title : (item as TVShow).name}
              </h3>
              <div className="content-meta">
                <span className="content-year">
                  {activeTab === "movies"
                    ? new Date((item as Movie).release_date).getFullYear()
                    : new Date((item as TVShow).first_air_date).getFullYear()}
                </span>
                <span className="content-rating">⭐ {item.vote_average.toFixed(1)}</span>
              </div>
              <p className="content-overview">
                {item.overview ? item.overview.substring(0, 100) + "..." : "No description available"}
              </p>
            </div>
          </div>
        ))}
      </div>

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

      {currentContent.length > 0 && page < totalPages && (
        <div className="load-more-container">
          <button className="load-more-btn" onClick={loadMore} disabled={loading}>
            {loading ? (
              <>
                <div className="loading-spinner small"></div>
                Loading...
              </>
            ) : (
              `Load More ${activeTab === "movies" ? "Movies" : "TV Shows"}`
            )}
          </button>
        </div>
      )}

      {currentContent.length === 0 && !loading && (
        <div className="no-content">
          <p>
            No {activeTab === "movies" ? "movies" : "TV shows"} found from {selectedCountry.native_name}.
          </p>
        </div>
      )}
    </div>
  )
}

export default CountryMoviesPage
