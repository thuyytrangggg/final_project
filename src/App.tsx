"use client"

import { useState, useEffect } from "react"
import Header from "./components/Header"
import HeroSection from "./components/HeroSection"
import RecentlyUpdatedSection from "./components/RecentlyUpdatedSection"
import MovieSection from "./components/MovieSection"
import LoadingSpinner from "./components/LoadingSpinner"
import TopicContentPage from "./pages/TopicContentPage"
import GenreMoviesPage from "./pages/GenreMoviesPage"
import CountryMoviesPage from "./pages/CountryMoviesPage"
import MoviesPage from "./pages/MoviesPage"
import SeriesPage from "./pages/SeriesPage"
import ActorsPage from "./pages/ActorsPage"
import MovieDetailsPage from "./pages/MovieDetailsPage"
import SearchResultsPage from "./pages/SearchResultsPage"
import { useMovieData } from "./hooks/useMovieData"
import { getImageUrl } from "./config/api"
import type { Genre, MediaItem } from "./types/mediaTypes"
import "./App.css"

interface Topic {
  id: number
  name: string
  background: string
  genreIds: number[]
}

interface Country {
  iso_3166_1: string
  english_name: string
  native_name: string
}

function App() {
  const { movieData, genres, loading, error } = useMovieData()
  const [currentPage, setCurrentPage] = useState("home")
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [selectedMediaItem, setSelectedMediaItem] = useState<MediaItem | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showScrollTop, setShowScrollTop] = useState(false)

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

  const handleNavigate = (page: string, data?: any) => {
    setCurrentPage(page)

    if (page === "genre-movies" && data?.selectedGenre) {
      setSelectedGenre(data.selectedGenre)
      setSelectedTopic(null)
      setSelectedCountry(null)
      setSelectedMediaItem(null)
      setSearchQuery("")
    } else if (page === "topic-movies" && data?.selectedTopic) {
      setSelectedTopic(data.selectedTopic)
      setSelectedGenre(null)
      setSelectedCountry(null)
      setSelectedMediaItem(null)
      setSearchQuery("")
    } else if (page === "country-movies" && data?.selectedCountry) {
      setSelectedCountry(data.selectedCountry)
      setSelectedGenre(null)
      setSelectedTopic(null)
      setSelectedMediaItem(null)
      setSearchQuery("")
    } else if (page === "movie-details" && data?.mediaItem) {
      setSelectedMediaItem(data.mediaItem)
      setSelectedGenre(null)
      setSelectedTopic(null)
      setSelectedCountry(null)
      setSearchQuery("")
    } else if (page === "search-results" && data?.searchQuery) {
      setSearchQuery(data.searchQuery)
      setSelectedGenre(null)
      setSelectedTopic(null)
      setSelectedCountry(null)
      setSelectedMediaItem(null)
    } else if (page === "movies" || page === "series" || page === "actor") {
      setSelectedGenre(null)
      setSelectedTopic(null)
      setSelectedCountry(null)
      setSelectedMediaItem(null)
      setSearchQuery("")
    } else {
      setSelectedGenre(null)
      setSelectedTopic(null)
      setSelectedCountry(null)
      setSelectedMediaItem(null)
      setSearchQuery("")
    }
  }

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic)
    setCurrentPage("topic-movies")
  }

  const handleBackToHome = () => {
    setCurrentPage("home")
    setSelectedGenre(null)
    setSelectedTopic(null)
    setSelectedCountry(null)
    setSelectedMediaItem(null)
    setSearchQuery("")
  }

  const handleBackToTopics = () => {
    setCurrentPage("topics")
    setSelectedTopic(null)
  }

  const handleMovieClick = (item: any) => {
    let mediaItem: MediaItem

    if (item.media_type) {
      mediaItem = item
    } else {
      mediaItem = {
        id: item.id,
        title: item.title,
        name: item.title,
        poster_path: item.poster?.includes("placeholder") ? null : extractPosterPath(item.poster),
        backdrop_path: null,
        vote_average: item.rating || 0,
        release_date: `${item.year}-01-01`,
        first_air_date: `${item.year}-01-01`,
        overview: `${item.title} - ${item.genres?.join(", ") || ""}`,
        genre_ids: [],
        genres: item.genres?.map((genre: string, index: number) => ({ id: index, name: genre })) || [],
        media_type: "movie" as const,
        adult: false,
        original_language: "en",
        original_title: item.title,
        popularity: item.rating * 100,
        vote_count: Math.floor(item.rating * 1000),
      }
    }

    setSelectedMediaItem(mediaItem)
    setCurrentPage("movie-details")
  }

  const extractPosterPath = (posterUrl: string): string | null => {
    if (!posterUrl || posterUrl.includes("placeholder")) return null
    const match = posterUrl.match(/\/w\d+(.+)$/)
    return match ? match[1] : null
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error loading data</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  const convertToMovieFormat = (items: any[]) => {
    return items.map((item) => ({
      id: item.id,
      title: item.title || item.name || "Unknown Title",
      poster: getImageUrl(item.poster_path, "w500") || "/placeholder.svg?height=300&width=200",
      year: item.release_date
        ? new Date(item.release_date).getFullYear()
        : item.first_air_date
          ? new Date(item.first_air_date).getFullYear()
          : 2023,
      rating: item.vote_average || 0,
      genres:
        item.genre_ids
          ?.slice(0, 2)
          .map((id: number) => genres[id])
          .filter(Boolean) || [],
    }))
  }

  const heroMovies = movieData.popularMovies.slice(0, 10)

  return (
    <div className="app">
      <Header onNavigate={handleNavigate} />

      {currentPage === "home" && (
        <>
          {heroMovies.length > 0 && (
            <HeroSection movies={heroMovies} movieGenres={genres} onMovieClick={handleMovieClick} />
          )}
          <div className="content">
            <RecentlyUpdatedSection onItemClick={handleMovieClick} />
            <MovieSection
              title="Trending Now"
              movies={convertToMovieFormat(movieData.trending.slice(1, 11))}
              onMovieClick={handleMovieClick}
            />
            <MovieSection
              title="Popular Movies"
              movies={convertToMovieFormat(movieData.popularMovies)}
              onMovieClick={handleMovieClick}
            />
            <MovieSection
              title="Now Playing"
              movies={convertToMovieFormat(movieData.nowPlaying)}
              onMovieClick={handleMovieClick}
            />
            <MovieSection
              title="Popular TV Shows"
              movies={convertToMovieFormat(movieData.popularTVShows)}
              onMovieClick={handleMovieClick}
            />
            <MovieSection
              title="Top Rated Movies"
              movies={convertToMovieFormat(movieData.topRatedMovies)}
              onMovieClick={handleMovieClick}
            />
            <MovieSection
              title="Top Rated TV Shows"
              movies={convertToMovieFormat(movieData.topRatedTVShows)}
              rows={2}
              onMovieClick={handleMovieClick}
            />
          </div>
          {showScrollTop && (
            <button className="scroll-to-top" onClick={scrollToTop}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M18 15L12 9L6 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </>
      )}

      {currentPage === "topics" && (
        <TopicContentPage onTopicSelect={handleTopicSelect} onMovieClick={handleMovieClick} />
      )}

      {currentPage === "topic-movies" && selectedTopic && (
        <TopicContentPage selectedTopic={selectedTopic} onBack={handleBackToTopics} onMovieClick={handleMovieClick} />
      )}

      {currentPage === "genre-movies" && selectedGenre && (
        <GenreMoviesPage selectedGenre={selectedGenre} onBack={handleBackToHome} onMovieClick={handleMovieClick} />
      )}

      {currentPage === "country-movies" && selectedCountry && (
        <CountryMoviesPage
          selectedCountry={selectedCountry}
          onBack={handleBackToHome}
          onMovieClick={handleMovieClick}
        />
      )}

      {currentPage === "movies" && <MoviesPage onBack={handleBackToHome} onMovieClick={handleMovieClick} />}

      {currentPage === "series" && <SeriesPage onBack={handleBackToHome} onMovieClick={handleMovieClick} />}

      {currentPage === "actor" && <ActorsPage onBack={handleBackToHome} />}

      {currentPage === "search-results" && searchQuery && (
        <SearchResultsPage searchQuery={searchQuery} onBack={handleBackToHome} onMovieClick={handleMovieClick} />
      )}

      {currentPage === "movie-details" && selectedMediaItem && (
        <MovieDetailsPage mediaItem={selectedMediaItem} onBack={handleBackToHome} />
      )}
    </div>
  )
}

export default App
