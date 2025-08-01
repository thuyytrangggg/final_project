"use client"

import { useState, useEffect } from "react"
import { getImageUrl, formatDate, formatRuntime } from "../config/api"
import type { MediaItem } from "../types/mediaTypes"
import styles from "../styles/HeroSection.module.css"

interface HeroSectionProps {
  movies: MediaItem[]
  movieGenres: { [key: number]: string }
  onMovieClick?: (movie: MediaItem) => void
}

function HeroSection({ movies, movieGenres, onMovieClick }: HeroSectionProps) {
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const heroMovies = movies.slice(0, 5)
  const currentMovie = heroMovies[currentMovieIndex] || heroMovies[0]

  useEffect(() => {
    if (!isAutoPlaying || heroMovies.length <= 1) return

    const interval = setInterval(() => {
      setCurrentMovieIndex((prev) => (prev + 1) % heroMovies.length)
    }, 5000) 

    return () => clearInterval(interval)
  }, [isAutoPlaying, heroMovies.length])

  const handleThumbnailClick = (index: number) => {
    if (index < heroMovies.length) {
      setCurrentMovieIndex(index)
      setIsAutoPlaying(false) 
    }
  }

  const handlePlayClick = () => {
    if (onMovieClick && currentMovie) {
      onMovieClick(currentMovie)
    }
  }

  if (!currentMovie) return null

  const genres = currentMovie.genre_ids
    ? currentMovie.genre_ids.map((id) => movieGenres[id]).filter(Boolean)
    : currentMovie.genres?.map((genre) => genre.name) || []

  const releaseYear = currentMovie.release_date
    ? formatDate(currentMovie.release_date)
    : currentMovie.first_air_date
      ? formatDate(currentMovie.first_air_date)
      : ""

  const runtime = currentMovie.runtime ? formatRuntime(currentMovie.runtime) : "2h 10m"
  const voteAverage = currentMovie.vote_average ? currentMovie.vote_average.toFixed(1) : "8.5"
  const title = currentMovie.title || currentMovie.name || "Unknown Title"

  const backgroundImage = currentMovie.backdrop_path
    ? getImageUrl(currentMovie.backdrop_path, "w1280")
    : "/placeholder.svg?height=500&width=1200"

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroBackground} style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className={styles.overlay}></div>
      </div>

      <div className={styles.heroContent}>
        <div className={styles.movieInfo}>
          <div className={styles.studioLogo}>
            <span className={styles.studioText}>MOVIE STUDIOS</span>
          </div>

          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>
            {currentMovie.original_title && currentMovie.original_title !== title
              ? currentMovie.original_title
              : "Bước Đi Đầu Tiên"}
          </p>

          <div className={styles.movieMeta}>
            <span className={styles.rating}>T13</span>
            <span className={styles.year}>{releaseYear || "2024"}</span>
            <span className={styles.duration}>{runtime}</span>
            <span className={styles.quality}>CAM</span>
          </div>

          <div className={styles.genres}>
            {genres.slice(0, 6).map((genre, index) => (
              <span key={index} className={styles.genreTag}>
                {genre}
              </span>
            ))}
          </div>

          <p className={styles.description}>
            {currentMovie.overview?.substring(0, 200) + "..." ||
              "Một bộ phim đầy hấp dẫn với những tình tiết ly kỳ và các nhân vật phong phú, mang đến trải nghiệm điện ảnh tuyệt vời cho khán giả..."}
          </p>

          <div className={styles.actionButtons}>
            <button className={styles.playButton} onClick={handlePlayClick}>
              <svg className={styles.playIcon} viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
            </button>
            <button className={styles.favoriteButton}>
              <svg className={styles.heartIcon} viewBox="0 0 24 24">
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button className={styles.infoButton}>
              <svg className={styles.infoIcon} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M12 16v-4M12 8h.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.movieThumbnails}>
          {heroMovies.map((movie, index) => (
            <div
              key={movie.id}
              className={`${styles.thumbnail} ${index === currentMovieIndex ? styles.active : ""}`}
              onClick={() => handleThumbnailClick(index)}
            >
              <div className={styles.thumbnailInner}>
                <img
                  src={getImageUrl(movie.poster_path, "w185") || "/placeholder.svg?height=120&width=80"}
                  alt={movie.title || movie.name}
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=120&width=80"
                  }}
                />
                <div className={styles.thumbnailOverlay}>
                  <span className={styles.thumbnailIndex}>{index + 1}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.progressIndicator}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              width: `${((currentMovieIndex + 1) / heroMovies.length) * 100}%`,
              animationDuration: isAutoPlaying ? "5s" : "0s",
            }}
          ></div>
        </div>
        <span className={styles.progressText}>
          {currentMovieIndex + 1} / {heroMovies.length}
        </span>
      </div>
    </section>
  )
}

export default HeroSection
