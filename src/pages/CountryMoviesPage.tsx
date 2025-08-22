"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { tmdbApi } from "../services/tmdbApi"
import { getImageUrl } from "../config/api"
import MovieCard from "../components/MovieCard"
import LoadingSpinner from "../components/LoadingSpinner"
import type { Movie, TVShow, MediaItem } from "../types/mediaTypes"
import "./CountryMoviesPage.css"

interface Country {
  iso_3166_1: string
  english_name: string
  native_name: string
}

interface CountryMoviesPageProps {
  selectedCountry: Country
  onBack: () => void
  onMovieClick: (movie: any) => void
}

const CountryMoviesPage: React.FC<CountryMoviesPageProps> = ({ selectedCountry, onBack, onMovieClick }) => {
  const [movies, setMovies] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [selectedCountry])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const fetchCountryData = async (countryCode: string, pageNum: number) => {
    const [movieResults, tvResults] = await Promise.all([
      tmdbApi.discoverMoviesByCountry(countryCode, pageNum),
      tmdbApi.discoverTVShowsByCountry(countryCode, pageNum),
    ])
    return [...movieResults, ...tvResults]
  }

  const loadInitialContent = async () => {
    try {
      setLoading(true)
      setMovies([])
      setCurrentPage(1)
      setHasMore(true)

      const page1Data = await fetchCountryData(selectedCountry.iso_3166_1, 1)
      const page2Data = await fetchCountryData(selectedCountry.iso_3166_1, 2)

      const all = [...page1Data, ...page2Data]

      const unique = all.filter((item, idx, self) => idx === self.findIndex((m) => m.id === item.id))
      const first24 = unique.slice(0, 24)

      setMovies(first24)
      setCurrentPage(2)
      setHasMore(unique.length >= 24 && page2Data.length > 0)
    } catch (err) {
      setError("Failed to load content")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInitialContent()
  }, [selectedCountry])

  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    try {
      setLoadingMore(true)
      let newItems: (Movie | TVShow)[] = []
      let nextPage = currentPage + 1

      while (newItems.length < 24 && nextPage <= 20) {
        const pageData = await fetchCountryData(selectedCountry.iso_3166_1, nextPage)
        if (pageData.length === 0) {
          setHasMore(false)
          break
        }
        const existingIds = new Set([...movies, ...newItems].map((m) => m.id))
        const uniquePageItems = pageData.filter((m) => !existingIds.has(m.id))
        newItems = [...newItems, ...uniquePageItems]
        nextPage++
      }

      const itemsToAdd = newItems.slice(0, 24)
      if (itemsToAdd.length > 0) {
        setMovies((prev) => [...prev, ...itemsToAdd])
        setCurrentPage(nextPage - 1)
      }
      if (itemsToAdd.length < 24) setHasMore(false)
    } catch (err) {
      console.error("Failed to load more:", err)
    } finally {
      setLoadingMore(false)
    }
  }

  const convertToMovieFormat = (items: (Movie | TVShow)[]): MediaItem[] => {
    return items.map((item: any) => {
      const isMovie = item.title !== undefined
      const title = isMovie ? item.title : item.name
      const releaseDate = item.release_date || item.first_air_date
      const year = releaseDate ? new Date(releaseDate).getFullYear() : 2023

      return {
        id: item.id,
        title,
        poster: getImageUrl(item.poster_path, "w500") || "/placeholder.svg?height=300&width=200",
        year,
        rating: item.vote_average || 0,
        genres: [],
        media_type: isMovie ? "movie" : "tv",
        backdrop_path: item.backdrop_path,
      }
    })
  }

  if (loading) {
    return (
      <div className="category-page">
        <div className="category-header">
          <button className="back-button" onClick={onBack}>
          </button>
          <h1 className="category-title">Loading {selectedCountry.native_name}...</h1>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="category-page">
        <div className="category-header">
          <button className="back-button" onClick={onBack}>
          </button>
          <h1 className="category-title">{selectedCountry.native_name}</h1>
        </div>
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button className="retry-button" onClick={loadInitialContent}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="category-page">
      <div className="category-header">
        <button className="back-button" onClick={onBack}>
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="24" viewBox="0 0 28 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="6" y1="12" x2="24" y2="12" />
            <polyline points="14 6 6 12 14 18" />
          </svg>
        </button>
        <h1 className="category-title">
          {selectedCountry.native_name}
        </h1>
      </div>

      <div className="category-content">
        <div className="movies-grid">
          {convertToMovieFormat(movies).map((movie) => (
            <MovieCard key={`${movie.id}-${movie.media_type}`} movie={movie} onMovieClick={onMovieClick} />
          ))}
        </div>

        {hasMore && (
          <div className="load-more-container">
            <button className="load-more-button" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? <div className="loading-spinner-small"></div> : 
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                }
            </button>
          </div>
        )}
      </div>

      {showScrollTop && (
        <button className="scroll-to-top" onClick={scrollToTop}>
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Thân mũi tên */}
            <line x1="12" y1="20" x2="12" y2="6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            {/* Đầu mũi tên */}
            <polyline
              points="6 12 12 6 18 12"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Đường kẻ ngang*/}
            <line x1="6" y1="2" x2="18" y2="2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default CountryMoviesPage
