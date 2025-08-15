"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { tmdbApi } from "../services/tmdbApi"
import type { MovieDetails, TVDetails } from "../types/mediaTypes"
import "../styles/MovieHoverModal.css"

interface MovieHoverModalProps {
  movieId: number
  mediaType: "movie" | "tv"
  movie: {
    id: number
    title: string
    poster: string
    year: number
    rating: number
    genres: string[]
    backdrop_path?: string
  }
}

const MovieHoverModal: React.FC<MovieHoverModalProps> = ({ movieId, mediaType, movie }) => {
  const [movieDetails, setMovieDetails] = useState<MovieDetails | TVDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true)
        const details =
          mediaType === "movie" ? await tmdbApi.getMovieDetails(movieId) : await tmdbApi.getTVDetails(movieId)
        setMovieDetails(details)
      } catch (error) {
        console.error("Error fetching movie details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovieDetails()
  }, [movieId, mediaType])

  if (loading) {
    return (
      <div className="modal-loading">
        <div className="loading-spinner-small"></div>
      </div>
    )
  }

  const backdropUrl = movieDetails?.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${movieDetails.backdrop_path}`
    : movie.backdrop_path
      ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
      : "/movie-backdrop.png"

  const title =
    mediaType === "movie"
      ? (movieDetails as MovieDetails)?.title || movie.title
      : (movieDetails as TVDetails)?.name || movie.title

  const releaseYear =
    mediaType === "movie"
      ? (movieDetails as MovieDetails)?.release_date?.split("-")[0] || movie.year
      : (movieDetails as TVDetails)?.first_air_date?.split("-")[0] || movie.year

  const genres = movieDetails?.genres?.map((g) => g.name) || movie.genres || []
  const rating = movieDetails?.vote_average || movie.rating || 8.0
  const overview = movieDetails?.overview || "No overview available."

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Play clicked for:", movie.title)
  }

  const handleAddToFavorites = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Added to favorites:", movie.title)
  }

  return (
    <div className="movie-hover-modal">
      {/* Backdrop section with play/favorite buttons */}
      <div className="modal-backdrop" style={{ backgroundImage: `url(${backdropUrl})` }}>
        <div className="modal-backdrop-overlay">
          <div className="modal-action-buttons">
            <button className="modal-play-button" onClick={handlePlayClick}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <button className="modal-favorite-button" onClick={handleAddToFavorites}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="modal-free-badge">Free</div>
      </div>

      {/* Movie information */}
      <div className="modal-content">
        <h3 className="modal-title">{title}</h3>

        <div className="modal-meta">
          <div className="modal-rating">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <span>{rating.toFixed(1)}</span>
          </div>
          <div className="modal-age-rating">13+</div>
          <div className="modal-year">{releaseYear}</div>
        </div>

        <div className="modal-genres">
          {genres.slice(0, 3).map((genre, index) => (
            <span key={index} className="modal-genre-tag">
              {genre}
            </span>
          ))}
        </div>

        <p className="modal-overview">{overview}</p>
      </div>
    </div>
  )
}

export default MovieHoverModal
