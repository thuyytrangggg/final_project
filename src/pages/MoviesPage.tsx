"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { tmdbApi } from "../services/tmdbApi"
import { getImageUrl } from "../config/api"
import MovieCard from "../components/MovieCard"
import LoadingSpinner from "../components/LoadingSpinner"
import type { Movie, MediaItem } from "../types/mediaTypes"
import "./MoviesPage.css"

interface MoviesPageProps {
  onBack: () => void
  onMovieClick: (movieData: any) => void
}

const MoviesPage: React.FC<MoviesPageProps> = ({ onBack, onMovieClick }) => {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<"popular" | "now_playing" | "upcoming" | "top_rated">("popular")
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const categories = [
    { key: "popular", label: "Popular", description: "Most popular movies right now" },
    { key: "now_playing", label: "Now Playing", description: "Currently in theaters" },
    { key: "upcoming", label: "Upcoming", description: "Coming soon to theaters" },
    { key: "top_rated", label: "Top Rated", description: "Highest rated movies of all time" },
  ] as const

  const fetchMoviesByCategory = async (category: string, pageNum: number) => {
    switch (category) {
      case "popular":
        return await tmdbApi.getPopularMovies(pageNum)
      case "now_playing":
        return await tmdbApi.getNowPlayingMovies(pageNum)
      case "upcoming":
        return await tmdbApi.getUpcomingMovies(pageNum)
      case "top_rated":
        return await tmdbApi.getTopRatedMovies(pageNum)
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

      const page1Data = await fetchMoviesByCategory(activeCategory, 1)
      const page2Data = await fetchMoviesByCategory(activeCategory, 2)

      const allMovies = [...page1Data, ...page2Data]

      // Xoá trùng
      const uniqueMovies = allMovies.filter((m, idx, self) => idx === self.findIndex((x) => x.id === m.id))

      // Lấy 24 phim đầu tiên
      const first24 = uniqueMovies.slice(0, 24)

      setMovies(first24)
      setCurrentPage(2) // đã lấy đến page 2
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
  }, [activeCategory])

  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    try {
      setLoadingMore(true)

      let newMovies: Movie[] = []
      let nextPage = currentPage + 1

      while (newMovies.length < 24 && nextPage <= 50) {
        const pageData = await fetchMoviesByCategory(activeCategory, nextPage)
        if (pageData.length === 0) {
          setHasMore(false)
          break
        }

        const existingIds = new Set([...movies, ...newMovies].map((m) => m.id))
        const uniquePageMovies = pageData.filter((m) => !existingIds.has(m.id))

        newMovies = [...newMovies, ...uniquePageMovies]
        nextPage++
      }

      const moviesToAdd = newMovies.slice(0, 24)

      if (moviesToAdd.length > 0) {
        setMovies((prev) => [...prev, ...moviesToAdd])
        setCurrentPage(nextPage - 1)
      }

      if (moviesToAdd.length < 24) setHasMore(false)
    } catch (err) {
      console.error("Failed to load more movies:", err)
    } finally {
      setLoadingMore(false)
    }
  }

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

  const convertToMovieFormat = (items: Movie[]): MediaItem[] => {
    return items.map((movie) => {
      const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 2023
      return {
        id: movie.id,
        title: movie.title,
        poster: getImageUrl(movie.poster_path, "w500") || "/placeholder.svg?height=300&width=200",
        year,
        rating: movie.vote_average || 0,
        genres: [],
        media_type: "movie",
        backdrop_path: movie.backdrop_path,
      }
    })
  }

  if (loading) {
    return (
      <div className="category-page">
        <div className="category-header">
          <button className="back-button" onClick={onBack}>← Back</button>
          <h1 className="category-title">Movies</h1>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="category-page">
        <div className="category-header">
          <button className="back-button" onClick={onBack}>← Back</button>
          <h1 className="category-title">Movies</h1>
        </div>
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button className="retry-button" onClick={loadInitialMovies}>Retry</button>
        </div>
      </div>
    )
  }

  const currentCategory = categories.find((c) => c.key === activeCategory)

  return (
    <div className="category-page">
      <div className="category-header">
        {/* <button className="back-button" onClick={onBack}>
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
        </button> */}
        <h1 className="category-title">Movies</h1>
      </div>

      <div className="category-tabs-movie">
        {categories.map((category) => (
          <button
            key={category.key}
            className={`category-tab-movie ${activeCategory === category.key ? "active" : ""}`}
            onClick={() => setActiveCategory(category.key)}
          >
            <span className="category-label">{category.label}</span>
            <span className="category-description">{category.description}</span>
          </button>
        ))}
      </div>

      <div className="category-content">
        <div className="movies-grid">
          {convertToMovieFormat(movies).map((movie) => (
            <MovieCard key={movie.id} movie={movie} onMovieClick={onMovieClick} />
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
                </svg>
                }
            </button>
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

export default MoviesPage
