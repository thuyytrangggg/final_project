"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import MovieCard from "./MovieCard"
import "../styles/MovieSection.css"

interface MovieSectionProps {
  title: string
  movies: any[]
  rows?: number
  onMovieClick: (movie: any) => void
  onViewAllClick?: (category: string) => void
  category?: string
}

const MovieSection: React.FC<MovieSectionProps> = ({
  title,
  movies,
  rows = 1,
  onMovieClick,
  onViewAllClick,
  category,
}) => {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Limit to 6 movies as requested
  const limitedMovies = movies.slice(0, 6)

  const checkScrollability = () => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5) // 5px tolerance
  }

  useEffect(() => {
    checkScrollability()

    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      // Use setTimeout to check after scroll animation completes
      setTimeout(checkScrollability, 100)
    }

    const handleResize = () => {
      checkScrollability()
    }

    container.addEventListener("scroll", handleScroll)
    window.addEventListener("resize", handleResize)

    return () => {
      container.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
    }
  }, [limitedMovies])

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = container.clientWidth * 0.8
    const targetScrollLeft =
      direction === "left" ? container.scrollLeft - scrollAmount : container.scrollLeft + scrollAmount

    container.scrollTo({
      left: targetScrollLeft,
      behavior: "smooth",
    })
  }

  const handleViewAllClick = () => {
    if (onViewAllClick && category) {
      onViewAllClick(category)
    }
  }

  return (
    <div className="movie-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {onViewAllClick && category && (
          <button className="view-all" onClick={handleViewAllClick}>
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
              <line x1="4" y1="12" x2="22" y2="12" />
              <polyline points="14 6 22 12 14 18" />
            </svg>
          </button>
        )}
      </div>

      <div className="movie-container">

        <div className={`movies-grid ${rows > 1 ? "multi-row" : "single-row"}`} ref={scrollContainerRef}>
           {limitedMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} onMovieClick={onMovieClick} />
        ))}
        </div>
      </div>
    </div>
  )
}

export default MovieSection
