"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { tmdbApi } from "../services/tmdbApi"
import { getImageUrl } from "../config/api"
import type { Movie, TVShow } from "../types/mediaTypes"
import type { TopicData } from "../data/topicsData"
import "./TopicMoviesPage.css"

interface TopicMoviesPageProps {
  selectedTopic: TopicData
  onBack: () => void
  onMovieClick?: (movieData: any) => void
}

const TopicMoviesPage: React.FC<TopicMoviesPageProps> = ({ selectedTopic, onBack, onMovieClick }) => {
  const [movies, setMovies] = useState<(Movie | TVShow)[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [activeTab, setActiveTab] = useState<"movies" | "tv">("movies")

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)
        setError(null)

        let allContent: (Movie | TVShow)[] = []

        // Fetch content for each genre ID in the topic
        const promises = selectedTopic.genreIds.map(async (genreId) => {
          if (activeTab === "movies") {
            return await tmdbApi.discoverMoviesByGenre(genreId, page)
          } else {
            return await tmdbApi.discoverTVShowsByGenre(genreId, page)
          }
        })

        const results = await Promise.all(promises)
        allContent = results.flat()

        // Remove duplicates and sort by popularity
        const uniqueContent = allContent
          .filter((item, index, self) => index === self.findIndex((i) => i.id === item.id))
          .sort((a, b) => b.popularity - a.popularity)

        if (page === 1) {
          setMovies(uniqueContent.slice(0, 20))
        } else {
          setMovies((prev) => [...prev, ...uniqueContent.slice(0, 20)])
        }

        setTotalPages(Math.min(10, Math.ceil(uniqueContent.length / 20)))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch content")
        console.error("Error fetching content:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [selectedTopic.genreIds, page, activeTab])

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (loading && page === 1) {
    return (
      <div className="topic-movies-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading {selectedTopic.name} content...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="topic-movies-container">
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="topic-movies-container">
      <div className="topic-header">
        <button className="back-button" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M19 12H5M12 19L5 12L12 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Topics
        </button>
        <h1 className="topic-title" style={{ background: selectedTopic.background }}>
          {selectedTopic.name}
        </h1>
        <p className="topic-subtitle">{selectedTopic.description}</p>
      </div>

      <div className="content-tabs">
        <button
          className={`tab-button ${activeTab === "movies" ? "active" : ""}`}
          onClick={() => setActiveTab("movies")}
        >
          Movies ({movies.filter(() => activeTab === "movies").length})
        </button>
        <button className={`tab-button ${activeTab === "tv" ? "active" : ""}`} onClick={() => setActiveTab("tv")}>
          TV Shows ({movies.filter(() => activeTab === "tv").length})
        </button>
      </div>

      <div className="content-grid">
        {movies.map((item) => (
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

      {movies.length > 0 && page < totalPages && (
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

      {movies.length === 0 && !loading && (
        <div className="no-content">
          <p>
            No {activeTab === "movies" ? "movies" : "TV shows"} found for {selectedTopic.name}.
          </p>
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

export default TopicMoviesPage
