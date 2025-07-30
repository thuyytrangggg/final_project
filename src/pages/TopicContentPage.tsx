"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { tmdbApi } from "../services/tmdbApi"
import { getImageUrl } from "../config/api"
import type { Movie, Genre } from "../types/mediaTypes"
import "./TopicContentPage.css"

interface Topic {
  id: number
  name: string
  background: string
  genreIds: number[]
}

interface TopicContentPageProps {
  selectedTopic?: Topic | null
  selectedGenre?: Genre | null
  onBack?: () => void
}

const TopicContentPage: React.FC<TopicContentPageProps> = ({ selectedTopic, selectedGenre, onBack }) => {
  const [topics, setTopics] = useState<Topic[]>([])
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMovies, setShowMovies] = useState(false)

  // Static topics data with genre mappings
  const staticTopics: Topic[] = [
    { id: 1, name: "Marvel", background: "linear-gradient(135deg, #6A5ACD, #483D8B)", genreIds: [28, 878, 12] },
    { id: 2, name: "Keo Lỳ Slayyy", background: "linear-gradient(135deg, #9932CC, #8A2BE2)", genreIds: [35, 18] },
    { id: 3, name: "Sitcom", background: "linear-gradient(135deg, #20B2AA, #008B8B)", genreIds: [35] },
    { id: 4, name: "4K", background: "linear-gradient(135deg, #8470FF, #6A5ACD)", genreIds: [28, 878, 53] },
    { id: 5, name: "Lồng Tiếng Cực Mạnh", background: "linear-gradient(135deg, #9370DB, #8A2BE2)", genreIds: [28, 12] },
    { id: 6, name: "Đỉnh Nóc", background: "linear-gradient(135deg, #00CED1, #20B2AA)", genreIds: [28, 53] },
    { id: 7, name: "Xuyên Không", background: "linear-gradient(135deg, #FF8C00, #FF4500)", genreIds: [878, 14] },
    { id: 8, name: "9x", background: "linear-gradient(135deg, #6B8E23, #556B2F)", genreIds: [18, 10749] },
    { id: 9, name: "Cổ Trang", background: "linear-gradient(135deg, #CD5C5C, #B22222)", genreIds: [36, 18] },
    { id: 10, name: "Tham Vọng", background: "linear-gradient(135deg, #C71585, #8B008B)", genreIds: [18, 80] },
    { id: 11, name: "Chữa Lành", background: "linear-gradient(135deg, #FFB6C1, #FF69B4)", genreIds: [18, 10749] },
    { id: 12, name: "Phù Thủy", background: "linear-gradient(135deg, #DA70D6, #BA55D3)", genreIds: [14, 27] },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        if (selectedTopic) {
          // Fetch movies for selected topic
          const moviePromises = selectedTopic.genreIds.map((genreId) => tmdbApi.discoverMoviesByGenre(genreId, 1))
          const movieResults = await Promise.all(moviePromises)
          const allMovies = movieResults.flat()

          // Remove duplicates and limit to 20 movies
          const uniqueMovies = allMovies
            .filter((movie, index, self) => index === self.findIndex((m) => m.id === movie.id))
            .slice(0, 20)

          setMovies(uniqueMovies)
          setShowMovies(true)
        } else if (selectedGenre) {
          // Fetch movies for selected genre
          const genreMovies = await tmdbApi.discoverMoviesByGenre(selectedGenre.id, 1)
          setMovies(genreMovies.slice(0, 20))
          setShowMovies(true)
        } else {
          // Show topics grid
          setTopics(staticTopics)
          setShowMovies(false)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data")
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedTopic, selectedGenre])

  const handleTopicClick = (topic: Topic) => {
    console.log("Selected topic:", topic)
    // This would be handled by parent component
  }

  if (loading) {
    return (
      <div className="topics-page-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="topics-page-container">
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  if (showMovies) {
    return (
      <div className="topics-page-container">
        {onBack && (
          <button className="back-button" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 12H5M12 19L5 12L12 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </button>
        )}
        <h1 className="topics-page-title">
          {selectedTopic ? `${selectedTopic.name} Movies` : selectedGenre ? `${selectedGenre.name} Movies` : "Movies"}
        </h1>
        <div className="movies-grid">
          {movies.map((movie) => (
            <div key={movie.id} className="movie-card">
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
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="topics-page-container">
      <h1 className="topics-page-title">Topics</h1>
      <div className="topics-grid">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="topic-card"
            style={{ background: topic.background }}
            onClick={() => handleTopicClick(topic)}
          >
            <div className="topic-card-content">
              <h3 className="topic-card-title">{topic.name}</h3>
              <a href="#" className="topic-card-link">
                View all
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TopicContentPage
