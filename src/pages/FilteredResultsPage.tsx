"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { tmdbApi } from "../services/tmdbApi"
import { getImageUrl } from "../config/api"
import type { FilterOptions, MediaItem } from "../types/mediaTypes"
import MovieCard from "../components/MovieCard"
import LoadingSpinner from "../components/LoadingSpinner"
import "../pages/FilteredResultsPage.css"

interface FilteredResultsPageProps {
  filters: FilterOptions
  onBack: () => void
  onMovieClick: (movieData: any) => void
  genres: { [key: number]: string }
}

const FilteredResultsPage: React.FC<FilteredResultsPageProps> = ({ filters, onBack, onMovieClick, genres }) => {
  const [filteredMovies, setFilteredMovies] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Scroll to top when component mounts or filters change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [filters])

  // Handle scroll to show/hide scroll to top button
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
    setFilteredMovies([])
    setCurrentPage(1)
    setHasMore(true)
    loadInitialMovies()
  }, [filters])

  // Load initial 24 movies (2 pages of 12 each)
  const loadInitialMovies = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch first 2 pages to get 24 movies initially
      const [page1Data, page2Data] = await Promise.all([
        tmdbApi.discoverMedia(filters, 1),
        tmdbApi.discoverMedia(filters, 2),
      ])

      const combinedData = [...page1Data, ...page2Data]

      // Remove duplicates
      const uniqueMovies = combinedData.filter(
        (movie, index, self) => index === self.findIndex((m) => m.id === movie.id),
      )

      setFilteredMovies(uniqueMovies.slice(0, 24)) // Ensure exactly 24 movies
      setCurrentPage(2) // We've loaded pages 1 and 2
      setHasMore(page2Data.length > 0)
    } catch (err) {
      console.error("Error loading initial movies:", err)
      setError("Không thể tải kết quả lọc. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  // Load more movies (24 at a time)
  const loadMore = async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)

    try {
      // Load next 2 pages to get 24 more movies
      const nextPage1 = currentPage + 1
      const nextPage2 = currentPage + 2

      const [page1Data, page2Data] = await Promise.all([
        tmdbApi.discoverMedia(filters, nextPage1),
        tmdbApi.discoverMedia(filters, nextPage2),
      ])

      const newMovies = [...page1Data, ...page2Data]

      if (newMovies.length === 0) {
        setHasMore(false)
        return
      }

      // Filter out duplicates
      setFilteredMovies((prev) => {
        const existingIds = new Set(prev.map((movie) => movie.id))
        const uniqueNewMovies = newMovies.filter((movie) => !existingIds.has(movie.id))
        return [...prev, ...uniqueNewMovies.slice(0, 24)] // Add up to 24 new movies
      })

      setCurrentPage(nextPage2)
      setHasMore(page2Data.length > 0)
    } catch (err) {
      console.error("Error loading more movies:", err)
      setError("Không thể tải thêm phim. Vui lòng thử lại.")
    } finally {
      setLoadingMore(false)
    }
  }

  const convertToMovieFormat = (items: MediaItem[]) => {
    return items.map((item) => {
      const isMovie = item.media_type === "movie" || (!item.media_type && item.title)
      const isTVShow = item.media_type === "tv" || (!item.media_type && item.name)

      let title = "Unknown Title"
      if (isMovie && item.title) {
        title = item.title
      } else if (isTVShow && item.name) {
        title = item.name
      } else if (item.original_title) {
        title = item.original_title
      } else if (item.original_name) {
        title = item.original_name
      }

      const releaseDate = item.release_date || item.first_air_date
      const year = releaseDate ? new Date(releaseDate).getFullYear() : 2023

      return {
        id: item.id,
        title: title,
        poster: getImageUrl(item.poster_path, "w500") || "/placeholder.svg?height=300&width=200",
        year: year,
        rating: item.vote_average || 0,
        genres:
          item.genre_ids
            ?.slice(0, 2)
            .map((id: number) => genres[id])
            .filter(Boolean) || [],
        media_type: item.media_type || (isMovie ? "movie" : "tv"),
        backdrop_path: item.backdrop_path,
      }
    })
  }

  if (loading) {
    return (
      <div className="filtered-results-page">
        <div className="filtered-results-header">
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
          <h1 className="filtered-results-title">Kết quả lọc</h1>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="filtered-results-page">
        <div className="filtered-results-header">
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
          <h1 className="filtered-results-title">Kết quả lọc</h1>
        </div>
        <div className="error-message">
          <h2>Lỗi</h2>
          <p>{error}</p>
          <button className="retry-button" onClick={loadInitialMovies}>
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="filtered-results-page">
      <div className="filtered-results-header">
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
        <h1 className="filtered-results-title">Kết quả lọc</h1>
      </div>

      <div className="filtered-results-content">
        {filteredMovies.length === 0 && !loading ? (
          <div className="no-results">
            <p>No results found.</p>
            <button onClick={onBack} className="back-to-filter-button">
              Change filters
            </button>
          </div>
        ) : (
          <>
            <div className="movies-grid">
              {convertToMovieFormat(filteredMovies).map((movie) => (
                <MovieCard key={`${movie.id}-${movie.media_type}`} movie={movie} onMovieClick={onMovieClick} />
              ))}
            </div>

            {hasMore && (
              <div className="load-more-container">
                <button className="load-more-button" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? (
                    <>
                      <div className="loading-spinner-small"></div>
                    </>
                  ) : (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

            {/* {!hasMore && filteredMovies.length > 0 && (
              <div className="end-message">
                <p>Bạn đã xem hết danh sách</p>
              </div>
            )} */}
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

export default FilteredResultsPage
