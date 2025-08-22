"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { tmdbApi } from "../services/tmdbApi"
import { getImageUrl } from "../config/api"
import MovieCard from "../components/MovieCard"
import LoadingSpinner from "../components/LoadingSpinner"
import type { MediaItem } from "../types/mediaTypes"
import type { TopicData } from "../data/topicsData"
import "./TopicMoviesPage.css"

interface TopicMoviesPageProps {
  selectedTopic: TopicData
  onBack: () => void
  onMovieClick?: (movieData: any) => void
}

const TopicMoviesPage: React.FC<TopicMoviesPageProps> = ({ selectedTopic, onBack, onMovieClick }) => {
  const [movies, setMovies] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [activeTab, setActiveTab] = useState<"movies" | "tv">("movies")

  // Scroll to top when component mounts or topic changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [selectedTopic])

  // Show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  useEffect(() => {
    setMovies([])
    setCurrentPage(1)
    setHasMore(true)
    loadInitialContent()
  }, [selectedTopic.genreIds, activeTab])

  // Load first 24 items
  const loadInitialContent = async () => {
    setLoading(true)
    setError(null)

    try {
      const promises = selectedTopic.genreIds.map(async (genreId) => {
        const [page1Data, page2Data] = await Promise.all([
          activeTab === "movies"
            ? tmdbApi.discoverMoviesByGenre(genreId, 1)
            : tmdbApi.discoverTVShowsByGenre(genreId, 1),
          activeTab === "movies"
            ? tmdbApi.discoverMoviesByGenre(genreId, 2)
            : tmdbApi.discoverTVShowsByGenre(genreId, 2),
        ])
        return [...page1Data, ...page2Data]
      })

      const results = await Promise.all(promises)
      const allContent = results.flat()

      // unique + sort
      const uniqueContent = allContent
        .filter((item, index, self) => index === self.findIndex((i) => i.id === item.id))
        .sort((a, b) => b.popularity - a.popularity)

      setMovies(uniqueContent.slice(0, 24))
      setCurrentPage(2)
      setHasMore(uniqueContent.length > 24)
    } catch (err) {
      setError("Failed to fetch content")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Load more (24 each time)
  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)

    try {
      const nextPage1 = currentPage + 1
      const nextPage2 = currentPage + 2

      const promises = selectedTopic.genreIds.map(async (genreId) => {
        const [page1Data, page2Data] = await Promise.all([
          activeTab === "movies"
            ? tmdbApi.discoverMoviesByGenre(genreId, nextPage1)
            : tmdbApi.discoverTVShowsByGenre(genreId, nextPage1),
          activeTab === "movies"
            ? tmdbApi.discoverMoviesByGenre(genreId, nextPage2)
            : tmdbApi.discoverTVShowsByGenre(genreId, nextPage2),
        ])
        return [...page1Data, ...page2Data]
      })

      const results = await Promise.all(promises)
      const newContent = results.flat()

      if (newContent.length === 0) {
        setHasMore(false)
        return
      }

      setMovies((prev) => {
        const existingIds = new Set(prev.map((item) => item.id))
        const uniqueNewContent = newContent.filter((item) => !existingIds.has(item.id))
        return [...prev, ...uniqueNewContent.slice(0, 24)]
      })

      setCurrentPage(nextPage2)
      setHasMore(newContent.length > 0)
    } catch (err) {
      console.error("Error loading more content:", err)
      setError("Không thể tải thêm nội dung. Vui lòng thử lại.")
    } finally {
      setLoadingMore(false)
    }
  }

  const convertToMovieFormat = (items: MediaItem[]) => {
    return items.map((item) => {
      const isMovie = activeTab === "movies"
      const title = isMovie ? item.title : item.name
      const releaseDate = item.release_date || item.first_air_date
      const year = releaseDate ? new Date(releaseDate).getFullYear() : 2023

      return {
        ...item, // giữ lại toàn bộ dữ liệu (overview, id, backdrop_path...)
        id: item.id,
        title: title || "Unknown Title",
        poster: getImageUrl(item.poster_path, "w500") || "/placeholder.svg?height=300&width=200",
        year,
        rating: item.vote_average || 0,
        genres: [],
        media_type: isMovie ? "movie" : "tv",
        backdrop_path: item.backdrop_path,
      }
    })
  }

  if (loading) {
    return (
      <div className="topic-movies-page">
        <div className="topic-movies-header">
          <button className="back-button" onClick={onBack}></button>
          <h1 className="topic-movies-title">{selectedTopic.name}</h1>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="topic-movies-page">
        <div className="topic-movies-header">
          <button className="back-button" onClick={onBack}></button>
          <h1 className="topic-movies-title">{selectedTopic.name}</h1>
        </div>
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button className="retry-button" onClick={loadInitialContent}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="topic-movies-page">
      <div className="topic-movies-header">
        <button className="back-button" onClick={onBack}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="24"
            viewBox="0 0 28 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="6" y1="12" x2="24" y2="12" />
            <polyline points="14 6 6 12 14 18" />
          </svg>
        </button>
        <h1 className="topic-movies-title">{selectedTopic.name}</h1>
      </div>

      <div className="topic-subtitle-container">
        <p className="topic-subtitle">{selectedTopic.description}</p>
      </div>

      <div className="content-tabs-topic">
        <button
          className={`tab-button-topic ${activeTab === "movies" ? "active" : ""}`}
          onClick={() => setActiveTab("movies")}
        >
          Movies
        </button>
        <button
          className={`tab-button-topic ${activeTab === "tv" ? "active" : ""}`}
          onClick={() => setActiveTab("tv")}
        >
          TV Shows
        </button>
      </div>

      <div className="topic-movies-content">
        {movies.length === 0 && !loading ? (
          <div className="no-results">
            <p>
              No {activeTab === "movies" ? "movies" : "TV shows"} found for {selectedTopic.name}.
            </p>
            <button onClick={onBack} className="back-to-topics-button">
              Back to Topics
            </button>
          </div>
        ) : (
          <>
            <div className="movies-grid">
              {convertToMovieFormat(movies).map((movie) => (
                <MovieCard
                  key={`${movie.id}-${movie.media_type}`}
                  movie={movie}
                  onMovieClick={onMovieClick}
                />
              ))}
            </div>

            {hasMore && (
              <div className="load-more-container">
                <button className="load-more-button" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? (
                    <div className="loading-spinner-small"></div>
                  ) : (
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 9L12 15L18 9"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>


      {showScrollTop && (
        <button className="scroll-to-top" onClick={scrollToTop}>
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="12" y1="20" x2="12" y2="6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <polyline
              points="6 12 12 6 18 12"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line x1="6" y1="2" x2="18" y2="2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  )
}


export default TopicMoviesPage
