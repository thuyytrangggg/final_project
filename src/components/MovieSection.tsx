import type React from "react"
import MovieCard from "./MovieCard"
import "../styles/MovieSection.css"

interface MovieSectionProps {
  title: string
  movies: {
    id: number
    title: string
    poster: string
    year: number
    rating: number
    genres: string[]
  }[]
  showViewAll?: boolean
  rows?: number
  onMovieClick?: (movieData: any) => void
}

const MovieSection: React.FC<MovieSectionProps> = ({ title, movies, showViewAll = true, rows = 1, onMovieClick }) => {
  return (
    <div className="movie-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {showViewAll && <button className="view-all">View all</button>}
      </div>
      <div className="movies-container" style={{ "--rows": rows } as React.CSSProperties}>
        <div className={`movies-grid ${rows > 1 ? "multi-row" : "single-row"}`}>
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onMovieClick={onMovieClick} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default MovieSection
