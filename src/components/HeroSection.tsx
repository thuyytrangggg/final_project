"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getImageUrl } from "../config/api"
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

  const heroMovies = movies.slice(0, 6)
  const currentMovie = heroMovies[currentMovieIndex] || heroMovies[0]

  useEffect(() => {
    if (!isAutoPlaying || heroMovies.length <= 1) return
    const interval = setInterval(() => {
      setCurrentMovieIndex((prev) => (prev + 1) % heroMovies.length)
    }, 7000)
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
    ? new Date(currentMovie.release_date).getFullYear().toString()
    : currentMovie.first_air_date
      ? new Date(currentMovie.first_air_date).getFullYear().toString()
      : ""

  const voteAverage = currentMovie.vote_average ? currentMovie.vote_average.toFixed(1) : "8.5"
  const title = currentMovie.title || currentMovie.name || "Unknown Title"

  const backgroundImage = currentMovie.backdrop_path
    ? getImageUrl(currentMovie.backdrop_path, "w1280")
    : "/placeholder.svg?height=500&width=1200"

  return (
    <section className={styles.heroSection}>
      {/* Background */}
      <div
        className={styles.heroBackground}
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className={styles.overlay}></div>
      </div>

      {/* Nội dung */}
      <div className={styles.heroContent}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMovieIndex}
            className={styles.movieInfo}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <h1 className={styles.title}>{title}</h1>

            <div className={styles.movieMeta}>
              {currentMovie.adult && <span className={styles.rating}>T18</span>}
              <span className={styles.rating}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    fill="#FFC107"
                    stroke="#FFC107"
                    strokeWidth="1"
                  />
                </svg>
                <span className={styles.ratingValue}>{voteAverage}</span>
              </span>
              <span className={styles.year}>{releaseYear || "2024"}</span>
            </div>

            <div className={styles.genres}>
              {genres.slice(0, 6).map((genre, index) => (
                <span key={index} className={styles.genreTag}>
                  {genre}
                </span>
              ))}
            </div>

            <p className={styles.description}>
              {currentMovie.overview ||
                "Một bộ phim đầy hấp dẫn với những tình tiết ly kỳ và các nhân vật phong phú..."}
            </p>

            <div className={styles.actionButtons}>
              <button className={styles.playButton} onClick={handlePlayClick}>
                <svg
                  className={styles.playIcon}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="5"
                  strokeLinejoin="round"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>


              <button className={styles.favoriteButton}>
                <svg className={styles.heartIcon} viewBox="0 0 24 24">
                  <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                    fill="currentColor"
                  />
                </svg>
              </button>

              <button className={styles.infoButton}>
                <svg className={styles.infoIcon} viewBox="0 0 24 24">
                  <defs>
                    <mask id="info-mask">
                      <rect width="100%" height="100%" fill="currentColor" />
                      <text
                        x="50%"
                        y="55%"
                        textAnchor="middle"
                        fontSize="14"
                        fontWeight="bold"
                        fill="black"
                        dy=".3em"
                      >
                        i
                      </text>
                    </mask>
                  </defs>
                  <circle cx="12" cy="12" r="10" fill="currentColor" mask="url(#info-mask)" />
                </svg>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Thumbnails */}
        <div className={styles.movieThumbnails}>
          {heroMovies.map((movie, index) => (
            <div
              key={movie.id}
              className={`${styles.thumbnail} ${index === currentMovieIndex ? styles.active : ""}`}
              onClick={() => handleThumbnailClick(index)}
            >
              <div className={styles.thumbnailInner}>
                <img
                  src={getImageUrl(movie.backdrop_path, "w300") || "/placeholder.svg?height=120&width=213"}
                  alt={movie.title || movie.name}
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=120&width=213"
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
    </section>
  )
}

export default HeroSection
