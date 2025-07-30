import { getImageUrl, formatDate, formatRuntime } from "../config/api"
import type { MediaItem } from "../types/mediaTypes"
import styles from "../styles/HeroSection.module.css"

interface HeroSectionProps {
  movie: MediaItem
  movieGenres: { [key: number]: string }
}

function HeroSection({ movie, movieGenres }: HeroSectionProps) {
  const genres = movie.genre_ids
    ? movie.genre_ids.map((id) => movieGenres[id]).filter(Boolean)
    : movie.genres?.map((genre) => genre.name) || []

  const releaseYear = movie.release_date
    ? formatDate(movie.release_date)
    : movie.first_air_date
      ? formatDate(movie.first_air_date)
      : ""

  const runtime = movie.runtime ? formatRuntime(movie.runtime) : "3:12:00"
  const voteAverage = movie.vote_average ? movie.vote_average.toFixed(1) : "8.5"
  const title = movie.title || movie.name || "Avatar: The Way of Water"

  const backgroundImage = movie.backdrop_path
    ? getImageUrl(movie.backdrop_path, "w1280")
    : "/placeholder.svg?height=500&width=1200"

  return (
    <section className={styles.heroSection}>
      <img
        src={backgroundImage || "/placeholder.svg"}
        alt={title}
        className={styles.heroBackground}
        onError={(e) => {
          e.currentTarget.src = "/placeholder.svg?height=500&width=1200"
        }}
      />
      <div className={styles.overlay}></div>

      <div className={styles.heroContent}>
        <div className={styles.content}>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.metadata}>
            {genres.slice(0, 3).map((genre, index) => (
              <span key={index} className={styles.genreTag}>
                {genre}
              </span>
            ))}
            <span className={styles.year}>📅 {releaseYear || "2022"}</span>
            <span className={styles.duration}>⏱ {runtime}</span>
            <span className={styles.rating}>⭐ {voteAverage}</span>
          </div>
          <p className={styles.description}>
            {movie.overview ||
              "Set more than a decade after the events of the first film, learn the story of the Sully family (Jake, Neytiri, and their kids), the trouble that follows them, the lengths they go to keep each other safe, the battles they fight to stay alive, and the tragedies they endure."}
          </p>
        </div>

        <div className={styles.buttons}>
          <button className={styles.watchButton}>
            <svg className={styles.playIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch Now
          </button>
          <button className={styles.watchLaterButton}>
            <svg className={styles.clockIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Watch Later
          </button>
        </div>
      </div>

      <div className={styles.paginationDots}>
        <span className={`${styles.dot} ${styles.active}`}></span>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
      </div>
    </section>
  )
}

export default HeroSection
