"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { tmdbApi } from "../services/tmdbApi"
import { getImageUrl } from "../config/api"
import type { Movie, Genre } from "../types/mediaTypes"
import "./GenreMoviesPage.css"

interface GenreMoviesPageProps {
  selectedGenre: Genre
  onBack: () => void
  onMovieClick?: (movieData: any) => void
}

const GenreMoviesPage: React.FC<GenreMoviesPageProps> = ({ selectedGenre, onBack, onMovieClick }) => {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await tmdbApi.discoverMoviesByGenre(selectedGenre.id, page)

        if (page === 1) {
          setMovies(response)
        } else {
          setMovies((prev) => [...prev, ...response])
        }

        setTotalPages(Math.min(20, Math.ceil(response.length > 0 ? 500 / 20 : 1)))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch movies")
        console.error("Error fetching movies:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [selectedGenre.id, page])

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

  const handleMovieClick = (movie: Movie) => {
    if (onMovieClick) {
      const mediaItem = {
        ...movie,
        media_type: "movie" as const,
        name: movie.title,
      }
      onMovieClick(mediaItem)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (loading && page === 1) {
    return (
      <div className="genre-movies-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading {selectedGenre.name} movies...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="genre-movies-container">
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="genre-movies-container">
      <div className="genre-header">
        <h1 className="genre-title">{selectedGenre.name} Movies</h1>
        <p className="genre-subtitle">Discover the best {selectedGenre.name.toLowerCase()} movies</p>
      </div>

      <div className="movies-grid">
        {movies.map((movie) => (
          <div key={movie.id} className="movie-card" onClick={() => handleMovieClick(movie)}>
            <div className="movie-poster">
              <img
                src={getImageUrl(movie.poster_path, "w500") || "/placeholder.svg?height=300&width=200"}
                alt={movie.title}
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=300&width=200"
                }}
              />
              <div className="movie-overlay">
                <button className="play-btn">▶</button>
              </div>
            </div>
            <div className="movie-info">
              <h3 className="movie-title">{movie.title}</h3>
              <div className="movie-meta">
                <span className="movie-year">{new Date(movie.release_date).getFullYear()}</span>
                <span className="movie-rating">⭐ {movie.vote_average.toFixed(1)}</span>
              </div>
              <p className="movie-overview">
                {movie.overview ? movie.overview.substring(0, 100) + "..." : "No description available"}
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

      {movies.length > 0 && page < totalPages && (
        <div className="load-more-container">
          <button className="load-more-btn" onClick={loadMore} disabled={loading}>
            {loading ? (
              <>
                <div className="loading-spinner small"></div>
                Loading...
              </>
            ) : (
              "Load More Movies"
            )}
          </button>
        </div>
      )}

      {movies.length === 0 && !loading && (
        <div className="no-movies">
          <p>No movies found for {selectedGenre.name} genre.</p>
        </div>
      )}
    </div>
  )
}

export default GenreMoviesPage
