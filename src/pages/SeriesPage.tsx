"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { tmdbApi } from "../services/tmdbApi"
import { getImageUrl } from "../config/api"
import type { TVShow } from "../types/mediaTypes"
import "./SeriesPage.css"

interface SeriesPageProps {
  onBack: () => void
  onMovieClick?: (movieData: any) => void
}

const SeriesPage: React.FC<SeriesPageProps> = ({ onBack, onMovieClick }) => {
  const [series, setSeries] = useState<TVShow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<"popular" | "top_rated" | "on_the_air" | "airing_today">(
    "popular",
  )
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const categories = [
    { key: "popular", label: "Popular", description: "Most popular TV shows right now" },
    { key: "top_rated", label: "Top Rated", description: "Highest rated TV shows of all time" },
    { key: "on_the_air", label: "On The Air", description: "Currently airing TV shows" },
    { key: "airing_today", label: "Airing Today", description: "TV shows airing today" },
  ] as const

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        setLoading(true)
        setError(null)

        let response: TVShow[] = []

        switch (activeCategory) {
          case "popular":
            response = await tmdbApi.getPopularTVShows(page)
            break
          case "top_rated":
            response = await tmdbApi.getTopRatedTVShows(page)
            break
          case "on_the_air":
            response = await tmdbApi.getOnTheAirTVShows(page)
            break
          case "airing_today":
            response = await tmdbApi.getAiringTodayTVShows(page)
            break
        }

        if (page === 1) {
          setSeries(response)
        } else {
          setSeries((prev) => [...prev, ...response])
        }

        // Estimate total pages
        setTotalPages(Math.min(20, Math.ceil(response.length > 0 ? 500 / 20 : 1)))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch TV shows")
        console.error("Error fetching TV shows:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchSeries()
  }, [activeCategory, page])

  useEffect(() => {
    // Reset page when switching categories
    setPage(1)
  }, [activeCategory])

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

  const handleSeriesClick = (show: TVShow) => {
    if (onMovieClick) {
      const mediaItem = {
        ...show,
        media_type: "tv" as const,
        title: show.name,
        release_date: show.first_air_date,
      }
      onMovieClick(mediaItem)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const currentCategory = categories.find((cat) => cat.key === activeCategory)

  if (loading && page === 1) {
    return (
      <div className="series-page-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading TV shows...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="series-page-container">
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="series-page-container">
      <div className="series-header">
        <h1 className="series-title">TV Series</h1>
        <p className="series-subtitle">Discover amazing TV shows and series from around the world</p>
      </div>

      <div className="category-tabs">
        {categories.map((category) => (
          <button
            key={category.key}
            className={`category-tab ${activeCategory === category.key ? "active" : ""}`}
            onClick={() => setActiveCategory(category.key)}
          >
            <span className="category-label">{category.label}</span>
            <span className="category-description">{category.description}</span>
          </button>
        ))}
      </div>

      <div className="current-category-info">
        <h2 className="category-title">{currentCategory?.label}</h2>
        <p className="category-subtitle">{currentCategory?.description}</p>
        <span className="series-count">({series.length} TV shows)</span>
      </div>

      <div className="series-grid">
        {series.map((show) => (
          <div key={show.id} className="series-card" onClick={() => handleSeriesClick(show)}>
            <div className="series-poster">
              <img
                src={getImageUrl(show.poster_path, "w500") || "/placeholder.svg?height=300&width=200"}
                alt={show.name}
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=300&width=200"
                }}
              />
              <div className="series-overlay">
                <button className="play-btn">▶</button>
              </div>
            </div>
            <div className="series-info">
              <h3 className="series-title">{show.name}</h3>
              <div className="series-meta">
                <span className="series-year">{new Date(show.first_air_date).getFullYear()}</span>
                <span className="series-rating">⭐ {show.vote_average.toFixed(1)}</span>
              </div>
              <p className="series-overview">
                {show.overview ? show.overview.substring(0, 100) + "..." : "No description available"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {series.length > 0 && page < totalPages && (
        <div className="load-more-container">
          <button className="load-more-btn" onClick={loadMore} disabled={loading}>
            {loading ? (
              <>
                <div className="loading-spinner small"></div>
                Loading...
              </>
            ) : (
              "Load More TV Shows"
            )}
          </button>
        </div>
      )}

      {series.length === 0 && !loading && (
        <div className="no-series">
          <p>No TV shows found in this category.</p>
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

export default SeriesPage
