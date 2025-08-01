"use client"

import type React from "react"
import "../styles/MovieCard.css"

interface MovieCardProps {
  movie: {
    id: number
    title: string
    poster: string
    year: number
    rating: number
    genres: string[]
  }
  onMovieClick?: (movieData: any) => void
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onMovieClick }) => {
  const handleClick = () => {
    if (onMovieClick) {
      onMovieClick(movie)
    }
  }

  return (
    <div className="movie-card" onClick={handleClick}>
      <div className="movie-poster">
        <img src={movie.poster || "/placeholder.svg?height=300&width=200"} alt={movie.title} />
        <div className="movie-overlay">
          <button className="play-btn">▶</button>
        </div>
      </div>
      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <div className="movie-meta">
          <span className="movie-year">{movie.year}</span>
          <span className="movie-rating">★ {movie.rating}</span>
        </div>
        <div className="movie-genres">
          {movie.genres.slice(0, 2).map((genre, index) => (
            <span key={index} className="genre-tag">
              {genre}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MovieCard
