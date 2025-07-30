"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { tmdbApi } from "../services/tmdbApi"
import type { Genre } from "../types/mediaTypes"
import "../styles/GenreModal.css"

interface GenreModalProps {
  isOpen: boolean
  onClose: () => void
  onGenreSelect?: (genre: Genre) => void
}

const GenreModal: React.FC<GenreModalProps> = ({ isOpen, onClose, onGenreSelect }) => {
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGenres = async () => {
      if (!isOpen) return

      try {
        setLoading(true)
        setError(null)

        const [movieGenres, tvGenres] = await Promise.all([tmdbApi.getMovieGenres(), tmdbApi.getTVGenres()])

        const allGenres = [...movieGenres, ...tvGenres]
        const uniqueGenres = allGenres.filter(
          (genre, index, self) => index === self.findIndex((g) => g.id === genre.id),
        )

        setGenres(uniqueGenres)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch genres")
        console.error("Error fetching genres:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchGenres()
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element
      if (!target.closest(".genre-dropdown") && !target.closest(".nav-link")) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleGenreClick = (genre: Genre) => {
    console.log("Selected genre:", genre)
    onGenreSelect?.(genre)
    onClose()
  }

  const getGenreColumns = () => {
    const itemsPerColumn = Math.ceil(genres.length / 4)
    const columns: Genre[][] = [[], [], [], []]

    genres.forEach((genre, index) => {
      const columnIndex = Math.floor(index / itemsPerColumn)
      if (columnIndex < 4) {
        columns[columnIndex].push(genre)
      }
    })

    return columns
  }

  return (
    <div className="genre-dropdown">
      {loading && (
        <div className="genre-loading">
          <div className="loading-spinner"></div>
          <p>Loading genres...</p>
        </div>
      )}

      {error && (
        <div className="genre-error">
          <p>Error loading genres</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {!loading && !error && genres.length > 0 && (
        <div className="genre-grid">
          {getGenreColumns().map((column, columnIndex) => (
            <div key={columnIndex} className="genre-column">
              {column.map((genre) => (
                <button key={genre.id} className="genre-item" onClick={() => handleGenreClick(genre)}>
                  {genre.name}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default GenreModal
