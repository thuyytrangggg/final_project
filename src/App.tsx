"use client"

import { useState, useEffect } from "react"
import Header from "./components/Header"
import HeroSection from "./components/HeroSection"
import RecentlyUpdatedSection from "./components/RecentlyUpdatedSection"
import MovieSection from "./components/MovieSection"
import LoadingSpinner from "./components/LoadingSpinner"
import TopicContentPage from "./pages/TopicContentPage"
import TopicMoviesPage from "./pages/TopicMoviesPage"
import GenreMoviesPage from "./pages/GenreMoviesPage"
import CountryMoviesPage from "./pages/CountryMoviesPage"
import MoviesPage from "./pages/MoviesPage"
import SeriesPage from "./pages/SeriesPage"
import ActorsPage from "./pages/ActorsPage"
import ActorDetailsPage from "./pages/ActorDetailsPage"
import MovieDetailsPage from "./pages/MovieDetailsPage"
import SearchResultsPage from "./pages/SearchResultsPage"
import FilteredResultsPage from "./pages/FilteredResultsPage" // Import the new page
import AccountPage from "./pages/AccountPage" // Import the new AccountPage
import { useMovieData } from "./hooks/useMovieData"
import { getImageUrl } from "./config/api"
import type { Genre, MediaItem, FilterOptions } from "./types/mediaTypes"
import type { TopicData } from "./data/topicsData"
import "./App.css"

interface Country {
  iso_3166_1: string
  english_name: string
  native_name: string
}

function App() {
  const { movieData, genres, loading, error } = useMovieData()
  const [currentPage, setCurrentPage] = useState("home")
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<TopicData | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [selectedMediaItem, setSelectedMediaItem] = useState<MediaItem | null>(null)
  const [selectedActorId, setSelectedActorId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [previousPage, setPreviousPage] = useState<string>("home") // Track previous page for navigation
  const [appliedFilters, setAppliedFilters] = useState<FilterOptions | null>(null) // State for applied filters

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
    setPreviousPage(currentPage) // Store current page as previous
    setCurrentPage(page)

    // Reset all specific selections
    setSelectedGenre(null)
    setSelectedTopic(null)
    setSelectedCountry(null)
    setSelectedMediaItem(null)
    setSelectedActorId(null)
    setSearchQuery("")
    setAppliedFilters(null) // Clear filters on general navigation

    if (page === "genre-movies" && data?.selectedGenre) {
      setSelectedGenre(data.selectedGenre)
    } else if (page === "topic-movies" && data?.selectedTopic) {
      setSelectedTopic(data.selectedTopic)
    } else if (page === "country-movies" && data?.selectedCountry) {
      setSelectedCountry(data.selectedCountry)
    } else if (page === "movie-details" && data?.mediaItem) {
      setSelectedMediaItem(data.mediaItem)
    } else if (page === "actor-details" && data?.actorId) {
      setSelectedActorId(data.actorId)
    } else if (page === "search-results" && data?.searchQuery) {
      setSearchQuery(data.searchQuery)
    } else if (page === "filtered-results" && data?.filters) {
      setAppliedFilters(data.filters)
    }
    // No specific data needed for "account" page
  }

  const handleTopicSelect = (topic: TopicData) => {
    setSelectedTopic(topic)
    setPreviousPage(currentPage)
    setCurrentPage("topic-movies")
  }

  const handleActorClick = (actorId: number) => {
    setSelectedActorId(actorId)
    setPreviousPage(currentPage)
    setCurrentPage("actor-details")
  }

  const handleBackToHome = () => {
    setCurrentPage("home")
    setSelectedGenre(null)
    setSelectedTopic(null)
    setSelectedCountry(null)
    setSelectedMediaItem(null)
    setSelectedActorId(null)
    setSearchQuery("")
    setAppliedFilters(null)
    setPreviousPage("home")
  }

  const handleBackToTopics = () => {
    setCurrentPage("topics")
    setSelectedTopic(null)
    setPreviousPage("topics")
  }

  const handleBackToActors = () => {
    setCurrentPage("actor")
    setSelectedActorId(null)
    setPreviousPage("actor")
  }

  const handleBackToPrevious = () => {
    // Navigate back to the previous page
    if (previousPage === "movie-details" && selectedMediaItem) {
      setCurrentPage("movie-details")
    } else if (previousPage === "actor") {
      setCurrentPage("actor")
      setSelectedActorId(null)
    } else if (previousPage === "topics" && appliedFilters) {
      // If coming from filtered results, go back to topics page with filter panel open
      setCurrentPage("topics")
      setAppliedFilters(null) // Clear filters when going back to topics
    } else {
      handleBackToHome()
    }
  }

  const handleMovieClick = (item: any) => {
    // Check if it's already a MediaItem (from API) or needs conversion (from MovieCard)
    let mediaItem: MediaItem

    if (item.media_type) {
      // Already a MediaItem from API or from MovieCard with media_type
      mediaItem = item
    } else {
      // Convert from MovieCard format (legacy or simplified) to MediaItem
      mediaItem = {
        id: item.id,
        title: item.title,
        name: item.title, // For TV shows, this will be overwritten by actual name if media_type is 'tv'
        poster_path: item.poster?.includes("placeholder") ? null : extractPosterPath(item.poster),
        backdrop_path: item.backdrop_path || null, // Use backdrop_path if available from MovieCard
        vote_average: item.rating || 0,
        release_date: `${item.year}-01-01`, // Default for movies
        first_air_date: `${item.year}-01-01`, // Default for TV shows
        overview: `${item.title} - ${item.genres?.join(", ") || ""}`,
        genre_ids: [], // Will be fetched by MovieDetailsPage
        genres: item.genres?.map((genre: string, index: number) => ({ id: index, name: genre })) || [],
        media_type: "movie" as const, // Default to movie, will be corrected by MovieDetailsPage if it's TV
        adult: false,
        original_language: "en",
        original_title: item.title,
        popularity: item.rating * 100,
        vote_count: Math.floor(item.rating * 1000),
      }
    }

    setSelectedMediaItem(mediaItem)
    setPreviousPage(currentPage)
    setCurrentPage("movie-details")
  }

  // Helper function to extract poster path from full URL
  const extractPosterPath = (posterUrl: string): string | null => {
    if (!posterUrl || posterUrl.includes("placeholder")) return null
    const match = posterUrl.match(/\/w\d+(.+)$/)
    return match ? match[1] : null
  }

  const handleApplyFilters = (filters: FilterOptions) => {
    setAppliedFilters(filters)
    setPreviousPage("topics") // Set previous page to topics
    setCurrentPage("filtered-results")
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

  const convertToMovieFormat = (items: MediaItem[]) => {
    return items.map((item) => ({
      id: item.id,
      title: item.media_type === "movie" ? item.title || "Unknown Title" : item.name || "Unknown Title", // Correctly use title for movie, name for TV
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
      media_type: item.media_type, // Pass media_type
      backdrop_path: item.backdrop_path, // Pass backdrop_path
    }))
  }

  // Get trending movies for hero section
  const heroMovies = movieData.trending.slice(0, 10) 

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
        <TopicContentPage
          onTopicSelect={handleTopicSelect}
          onMovieClick={handleMovieClick}
          onApplyFilters={handleApplyFilters}
        />
      )}

      {currentPage === "topic-movies" && selectedTopic && (
        <TopicMoviesPage selectedTopic={selectedTopic} onBack={handleBackToTopics} onMovieClick={handleMovieClick} />
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

      {currentPage === "actor" && <ActorsPage onBack={handleBackToHome} onActorClick={handleActorClick} />}

      {currentPage === "actor-details" && selectedActorId && (
        <ActorDetailsPage actorId={selectedActorId} onBack={handleBackToPrevious} onMovieClick={handleMovieClick} />
      )}

      {currentPage === "search-results" && searchQuery && (
        <SearchResultsPage searchQuery={searchQuery} onBack={handleBackToHome} onMovieClick={handleMovieClick} />
      )}

      {currentPage === "movie-details" && selectedMediaItem && (
        <MovieDetailsPage mediaItem={selectedMediaItem} onBack={handleBackToPrevious} onActorClick={handleActorClick} />
      )}

      {currentPage === "filtered-results" && appliedFilters && (
        <FilteredResultsPage
          filters={appliedFilters}
          onBack={handleBackToTopics}
          onMovieClick={handleMovieClick}
          genres={genres}
        />
      )}

      {currentPage === "account" && <AccountPage />}
    </div>
  )
}

export default App
