"use client"

import type React from "react"
import { useState, useRef } from "react"
import MovieHoverModal from "./MovieHoverModal"
import "../styles/MovieCard.css"

interface MovieCardProps {
  movie: {
    id: number
    title: string
    poster: string
    year: number
    rating: number
    genres: string[]
    media_type?: "movie" | "tv"
    backdrop_path?: string
  }
  onMovieClick?: (movieData: any) => void
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onMovieClick }) => {
  const [showModal, setShowModal] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleClick = () => {
    if (onMovieClick) {
      onMovieClick(movie)
    }
  }

  const handleMouseEnter = () => {
    console.log("Mouse entered card:", movie.title)

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }

    hoverTimeoutRef.current = setTimeout(() => {
      console.log("Showing modal for:", movie.title)
      setShowModal(true)
    }, 500)
  }

  const handleMouseLeave = () => {
    console.log("Mouse left card:", movie.title)

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    setShowModal(false)
  }

  // Handle mouse events for the entire wrapper (card + modal)
  const handleWrapperMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
  }

  const handleWrapperMouseLeave = () => {
    console.log("Mouse left wrapper:", movie.title)
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    setShowModal(false)
  }

  return (
    <div className="movie-card-wrapper" onMouseEnter={handleWrapperMouseEnter} onMouseLeave={handleWrapperMouseLeave}>
      <div
        ref={cardRef}
        className="movie-card"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {!showModal && (
          <>
            <div className="movie-poster">
              <img src={movie.poster || "/placeholder.svg?height=300&width=200"} alt={movie.title} />

              {/* Badge "New" ở góc trên phải */}
              {/* <span className="movie-badge">New</span> */}

              {/* Rating ở góc dưới trái */}
              <div className="movie-rating-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    fill="#FFC107"
                    stroke="#FFC107"
                    strokeWidth="1"
                  />
                </svg>
                <span className="movie-rating-value">{movie.rating ? movie.rating.toFixed(1) : "8.0"}</span>
              </div>
            </div>

            {/* Title bên dưới poster */}
            <p className="movie-title-below">{movie.title}</p>
          </>
        )}
      </div>

      {/* Hover Modal - gắn chặt với card và cuộn cùng card */}
      {showModal && (
        <div className="movie-hover-modal-container">
          <MovieHoverModal movieId={movie.id} mediaType={movie.media_type || "movie"} movie={movie} />
        </div>
      )}
    </div>
  )
}

export default MovieCard
