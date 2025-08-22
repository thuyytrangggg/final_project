"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { tmdbApi } from "../services/tmdbApi"
import { getImageUrl } from "../config/api"
import MovieCard from "../components/MovieCard"
import LoadingSpinner from "../components/LoadingSpinner"
import type { MediaItem } from "../types/mediaTypes"
import "./SearchResultsPage.css"

interface SearchResultsPageProps {
  searchQuery: string
  onBack: () => void
  onMovieClick: (movie: MediaItem) => void
}

const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ searchQuery, onBack, onMovieClick }) => {
  const [results, setResults] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [searchQuery])

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

  const fetchSearchResults = async (pageNum: number) => {
    try {
      setLoading(true)
      setError(null)

      const [res1, res2] = await Promise.all([
        tmdbApi.searchMulti(searchQuery, pageNum),
        tmdbApi.searchMulti(searchQuery, pageNum + 1),
      ])

      const combined = [...res1, ...res2]

      const uniqueResults = combined.filter(
        (item, index, self) => index === self.findIndex((m) => m.id === item.id)
      )

      return uniqueResults.slice(0, 24)
    } catch (err) {
      throw err
    }
  }

  const loadInitialResults = async () => {
    try {
      setResults([])
      setCurrentPage(1)
      setHasMore(true)

      const firstResults = await fetchSearchResults(1)

      setResults(firstResults)
      setCurrentPage(2) 
      setHasMore(firstResults.length === 24)
    } catch (err) {
      setError("Failed to search")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchQuery.trim()) {
      loadInitialResults()
    }
  }, [searchQuery])

  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    try {
      setLoadingMore(true)
      const newResults = await fetchSearchResults(currentPage + 1)

      if (newResults.length > 0) {
        setResults((prev) => [...prev, ...newResults])
        setCurrentPage((prev) => prev + 2) // tăng thêm 2 page
      } else {
        setHasMore(false)
      }
    } catch (err) {
      console.error("Failed to load more:", err)
    } finally {
      setLoadingMore(false)
    }
  }

  const convertToMovieFormat = (items: MediaItem[]) => {
    return items.map((item) => {
      const isMovie = item.media_type === "movie" || (!item.media_type && item.title)
      const isTVShow = item.media_type === "tv" || (!item.media_type && item.name)

      let title = item.title || item.name || item.original_title || item.original_name || "Unknown Title"
      const releaseDate = item.release_date || item.first_air_date
      const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A"

      return {
        id: item.id,
        title: title,
        poster: getImageUrl(item.poster_path, "w500") || "/placeholder.svg?height=300&width=200",
        year: year,
        rating: item.vote_average || 0,
        genres: [],
        media_type: item.media_type || (isMovie ? "movie" : "tv"),
        backdrop_path: item.backdrop_path,
      }
    })
  }

  if (loading && results.length === 0) {
    return (
      <div className="search-page">
        <div className="loading-state">
          <LoadingSpinner />
          <p>Searching for "{searchQuery}"...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="search-page">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button className="retry-button" onClick={loadInitialResults}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="search-results-container">
      <div className="search-content">
        <div className="search-results-grid">
          {convertToMovieFormat(results).map((movie) => (
            <MovieCard key={`${movie.id}-${movie.media_type}`} movie={movie} onMovieClick={onMovieClick} />
          ))}
        </div>

        {hasMore && (
          <div className="load-more-container">
            <button className="load-more-button" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? <div className="loading-spinner-small"></div> : 
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>}
            </button>
          </div>
        )}

        {!hasMore && results.length > 0 && (
          <div className="end-message">
            <p>You've reached the end of the results</p>
          </div>
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

export default SearchResultsPage
