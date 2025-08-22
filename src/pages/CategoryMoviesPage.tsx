"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { tmdbApi } from "../services/tmdbApi"
import { getImageUrl } from "../config/api"
import MovieCard from "../components/MovieCard"
import LoadingSpinner from "../components/LoadingSpinner"
import type { MediaItem } from "../types/mediaTypes"
import "./CategoryMoviesPage.css"

interface CategoryMoviesPageProps {
  category: string
  onBack: () => void
  onMovieClick: (movie: any) => void
}

const CategoryMoviesPage: React.FC<CategoryMoviesPageProps> = ({ category, onBack, onMovieClick }) => {
  const [movies, setMovies] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalMovies, setTotalMovies] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Scroll to top when component mounts or category changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [category])

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

  const getCategoryTitle = (category: string) => {
    const titles: { [key: string]: string } = {
      trending: "Trending Now",
      popularMovies: "Popular Movies",
      nowPlaying: "Now Playing",
      popularTVShows: "Popular TV Shows",
      topRatedMovies: "Top Rated Movies",
      topRatedTVShows: "Top Rated TV Shows",
    }
    return titles[category] || "Movies"
  }

  const fetchCategoryData = async (category: string, pageNum: number) => {
    switch (category) {
      case "trending":
        return await tmdbApi.getTrending("all", "week", pageNum)
      case "popularMovies":
        return await tmdbApi.getPopularMovies(pageNum)
      case "nowPlaying":
        return await tmdbApi.getNowPlayingMovies(pageNum)
      case "popularTVShows":
        return await tmdbApi.getPopularTVShows(pageNum)
      case "topRatedMovies":
        return await tmdbApi.getTopRatedMovies(pageNum)
      case "topRatedTVShows":
        return await tmdbApi.getTopRatedTVShows(pageNum)
      default:
        return []
    }
  }

  const loadInitialMovies = async () => {
    try {
      setLoading(true)
      setMovies([])
      setCurrentPage(1)
      setHasMore(true)
      setTotalMovies(0)

      // Load first 24 movies (pages 1 and 2, each page has ~20 items)
      const page1Data = await fetchCategoryData(category, 1)
      const page2Data = await fetchCategoryData(category, 2)

      const allMovies = [...page1Data, ...page2Data]

      // Remove duplicates by ID
      const uniqueMovies = allMovies.filter((movie, index, self) => index === self.findIndex((m) => m.id === movie.id))

      // Take first 24 movies
      const first24Movies = uniqueMovies.slice(0, 24)

      setMovies(first24Movies)
      setTotalMovies(first24Movies.length)
      setCurrentPage(2) // We've loaded pages 1 and 2

      // Check if there are more movies available
      setHasMore(uniqueMovies.length >= 24 && page2Data.length > 0)
    } catch (err) {
      setError("Failed to load movies")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInitialMovies()
  }, [category])

  const loadMore = async () => {
    if (loadingMore || !hasMore) return

    try {
      setLoadingMore(true)

      // Calculate how many more movies we need to reach the next 24 increment
      const currentCount = movies.length
      const targetCount = Math.ceil((currentCount + 1) / 24) * 24
      const moviesNeeded = targetCount - currentCount

      let newMovies: MediaItem[] = []
      let nextPage = currentPage + 1

      // Keep fetching until we have enough movies or no more pages
      while (newMovies.length < moviesNeeded && nextPage <= 50) {
        // TMDB has max 500 pages, but we limit to 50 for performance
        const pageData = await fetchCategoryData(category, nextPage)

        if (pageData.length === 0) {
          setHasMore(false)
          break
        }

        // Filter out movies that already exist
        const existingIds = new Set([...movies, ...newMovies].map((movie) => movie.id))
        const uniquePageMovies = pageData.filter((movie) => !existingIds.has(movie.id))

        newMovies = [...newMovies, ...uniquePageMovies]
        nextPage++
      }

      // Take only the movies we need (up to 24 more)
      const moviesToAdd = newMovies.slice(0, moviesNeeded)

      if (moviesToAdd.length > 0) {
        setMovies((prev) => [...prev, ...moviesToAdd])
        setTotalMovies((prev) => prev + moviesToAdd.length)
        setCurrentPage(nextPage - 1)
      }

      // Check if we can load more
      if (moviesToAdd.length < moviesNeeded || newMovies.length < moviesNeeded) {
        setHasMore(false)
      }
    } catch (err) {
      console.error("Failed to load more movies:", err)
    } finally {
      setLoadingMore(false)
    }
  }

  const convertToMovieFormat = (items: MediaItem[]) => {
    return items.map((item) => {
      // Determine if it's a movie or TV show
      const isMovie = item.media_type === "movie" || (!item.media_type && item.title)
      const isTVShow = item.media_type === "tv" || (!item.media_type && item.name)

      // Get the correct title
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

      // Get the correct date
      const releaseDate = item.release_date || item.first_air_date
      const year = releaseDate ? new Date(releaseDate).getFullYear() : 2023

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

  if (loading) {
    return (
      <div className="category-page">
        <div className="category-header">
          <button className="back-button" onClick={onBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 12H5M12 19L5 12L12 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className="category-title">{getCategoryTitle(category)}</h1>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="category-page">
        <div className="category-header">
          <button className="back-button" onClick={onBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 12H5M12 19L5 12L12 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className="category-title">{getCategoryTitle(category)}</h1>
        </div>
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button className="retry-button" onClick={loadInitialMovies}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="category-page">
      <div className="category-header">
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
        <h1 className="category-title">{getCategoryTitle(category)}</h1>
      </div>

      <div className="category-content">
        <div className="movies-grid">
          {convertToMovieFormat(movies).map((movie) => (
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

        {!hasMore && movies.length > 0 && (
          <div className="end-message">
            <p>You've reached the end of the list</p>
          </div>
        )}
      </div>

      {showScrollTop && (
        <button className="scroll-to-top" onClick={scrollToTop}>
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Thân mũi tên */}
            <line x1="12" y1="20" x2="12" y2="6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            {/* Đầu mũi tên */}
            <polyline
              points="6 12 12 6 18 12"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Đường kẻ ngang*/}
            <line x1="6" y1="2" x2="18" y2="2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default CategoryMoviesPage
