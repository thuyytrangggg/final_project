"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
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
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })

      setTimeout(() => {
        checkScrollability()
      }, 600)
    }
  }

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current

      setCanScrollLeft(scrollLeft > 5)

      const maxScrollLeft = scrollWidth - clientWidth
      setCanScrollRight(scrollLeft < maxScrollLeft - 5)
    }
  }

  useEffect(() => {
    checkScrollability()
  }, [movies])

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScrollability)
      window.addEventListener("resize", checkScrollability)

      return () => {
        scrollContainer.removeEventListener("scroll", checkScrollability)
        window.removeEventListener("resize", checkScrollability)
      }
    }
  }, [])

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener("scrollend", checkScrollability)
      return () => {
        scrollContainer.removeEventListener("scrollend", checkScrollability)
      }
    }
  }, [])

  return (
    <div className="movie-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {showViewAll && <button className="view-all">View all</button>}
      </div>
      <div className="movies-container" style={{ "--rows": rows } as React.CSSProperties}>
        <div className="movies-wrapper">
          {canScrollLeft && (
            <button className="nav-arrow left-arrow" onClick={() => scroll("left")}>
              <ChevronLeft strokeWidth={3} />
            </button>
          )}
          <div className={`movies-grid ${rows > 1 ? "multi-row" : "single-row"}`} ref={scrollContainerRef}>
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onMovieClick={onMovieClick} />
            ))}
          </div>
          {canScrollRight && (
            <button className="nav-arrow right-arrow" onClick={() => scroll("right")}>
              <ChevronRight strokeWidth={3} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default MovieSection
