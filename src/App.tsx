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
import FilteredResultsPage from "./pages/FilteredResultsPage"
import CategoryMoviesPage from "./pages/CategoryMoviesPage"
import AccountPage from "./pages/AccountPage"
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

// Global scroll position storage
const scrollPositions = new Map<string, number>()

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
  const [previousPage, setPreviousPage] = useState<string>("home")
  const [appliedFilters, setAppliedFilters] = useState<FilterOptions | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Save scroll position when navigating away from a page
  const saveScrollPosition = (page: string) => {
    scrollPositions.set(page, window.scrollY)
  }

  // Restore scroll position immediately without animation
  const restoreScrollPosition = (page: string) => {
    const savedPosition = scrollPositions.get(page)
    if (savedPosition !== undefined) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo(0, savedPosition)
      })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleNavigate = (page: string, data?: any) => {
    // Save current scroll position
    saveScrollPosition(currentPage)

    setPreviousPage(currentPage)
    setCurrentPage(page)

    // Reset all specific selections
    setSelectedGenre(null)
    setSelectedTopic(null)
    setSelectedCountry(null)
    setSelectedMediaItem(null)
    setSelectedActorId(null)
    setSearchQuery("")
    setAppliedFilters(null)
    setSelectedCategory(null)

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
    } else if (page === "category-movies" && data?.category) {
      setSelectedCategory(data.category)
    }
  }

  const handleViewAllClick = (category: string) => {
    console.log("View All clicked for category:", category)
    // Save current scroll position before navigating
    saveScrollPosition(currentPage)

    setSelectedCategory(category)
    setPreviousPage(currentPage)
    setCurrentPage("category-movies")
  }

  const handleTopicSelect = (topic: TopicData) => {
    saveScrollPosition(currentPage)
    setSelectedTopic(topic)
    setPreviousPage(currentPage)
    setCurrentPage("topic-movies")
  }

  const handleActorClick = (actorId: number) => {
    saveScrollPosition(currentPage)
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
    setSelectedCategory(null)
    setPreviousPage("home")

    // Restore scroll position for home page immediately
    restoreScrollPosition("home")
  }

  const handleBackToTopics = () => {
    setCurrentPage("topics")
    setSelectedTopic(null)
    setPreviousPage("topics")

    // Restore scroll position for topics page immediately
    restoreScrollPosition("topics")
  }

  const handleBackToActors = () => {
    setCurrentPage("actor")
    setSelectedActorId(null)
    setPreviousPage("actor")

    // Restore scroll position for actors page immediately
    restoreScrollPosition("actor")
  }

  const handleBackToPrevious = () => {
    if (previousPage === "movie-details" && selectedMediaItem) {
      setCurrentPage("movie-details")
    } else if (previousPage === "actor") {
      setCurrentPage("actor")
      setSelectedActorId(null)
      restoreScrollPosition("actor")
    } else if (previousPage === "topics" && appliedFilters) {
      setCurrentPage("topics")
      setAppliedFilters(null)
      restoreScrollPosition("topics")
    } else {
      handleBackToHome()
    }
  }

  const handleMovieClick = (item: any) => {
    // Save current scroll position
    saveScrollPosition(currentPage)

    let mediaItem: MediaItem

    if (item.media_type) {
      mediaItem = item
    } else {
      mediaItem = {
        id: item.id,
        title: item.title,
        name: item.title,
        poster_path: item.poster?.includes("placeholder") ? null : extractPosterPath(item.poster),
        backdrop_path: item.backdrop_path || null,
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
    setPreviousPage(currentPage)
    setCurrentPage("movie-details")
  }

  const extractPosterPath = (posterUrl: string): string | null => {
    if (!posterUrl || posterUrl.includes("placeholder")) return null
    const match = posterUrl.match(/\/w\d+(.+)$/)
    return match ? match[1] : null
  }

  const handleApplyFilters = (filters: FilterOptions) => {
    saveScrollPosition(currentPage)
    setAppliedFilters(filters)
    setPreviousPage("topics")
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
      title: item.media_type === "movie" ? item.title || "Unknown Title" : item.name || "Unknown Title",
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
      media_type: item.media_type,
      backdrop_path: item.backdrop_path,
    }))
  }

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
              movies={convertToMovieFormat(movieData.trending.slice(0, 10))}
              onMovieClick={handleMovieClick}
              onViewAllClick={handleViewAllClick}
              category="trending"
            />
            <MovieSection
              title="Popular Movies"
              movies={convertToMovieFormat(movieData.popularMovies)}
              onMovieClick={handleMovieClick}
              onViewAllClick={handleViewAllClick}
              category="popularMovies"
            />
            <MovieSection
              title="Now Playing"
              movies={convertToMovieFormat(movieData.nowPlaying)}
              onMovieClick={handleMovieClick}
              onViewAllClick={handleViewAllClick}
              category="nowPlaying"
            />
            <MovieSection
              title="Popular TV Shows"
              movies={convertToMovieFormat(movieData.popularTVShows)}
              onMovieClick={handleMovieClick}
              onViewAllClick={handleViewAllClick}
              category="popularTVShows"
            />
            <MovieSection
              title="Top Rated Movies"
              movies={convertToMovieFormat(movieData.topRatedMovies)}
              onMovieClick={handleMovieClick}
              onViewAllClick={handleViewAllClick}
              category="topRatedMovies"
            />
            <MovieSection
              title="Top Rated TV Shows"
              movies={convertToMovieFormat(movieData.topRatedTVShows)}
              onMovieClick={handleMovieClick}
              onViewAllClick={handleViewAllClick}
              category="topRatedTVShows"
            />
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

      {currentPage === "category-movies" && selectedCategory && (
        <CategoryMoviesPage category={selectedCategory} onBack={handleBackToHome} onMovieClick={handleMovieClick} />
      )}

      {currentPage === "account" && <AccountPage />}
    </div>
  )
}

export default App
