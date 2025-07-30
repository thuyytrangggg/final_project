"use client"

import { useState } from "react"
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

  const handleNavigate = (page: string, data?: any) => {
    setCurrentPage(page)

    if (page === "genre-movies" && data?.selectedGenre) {
      setSelectedGenre(data.selectedGenre)
      setSelectedTopic(null)
      setSelectedCountry(null)
      setSelectedMediaItem(null)
    } else if (page === "topic-movies" && data?.selectedTopic) {
      setSelectedTopic(data.selectedTopic)
      setSelectedGenre(null)
      setSelectedCountry(null)
      setSelectedMediaItem(null)
    } else if (page === "country-movies" && data?.selectedCountry) {
      setSelectedCountry(data.selectedCountry)
      setSelectedGenre(null)
      setSelectedTopic(null)
      setSelectedMediaItem(null)
    } else if (page === "movie-details" && data?.mediaItem) {
      setSelectedMediaItem(data.mediaItem)
      setSelectedGenre(null)
      setSelectedTopic(null)
      setSelectedCountry(null)
    } else if (page === "movies" || page === "series" || page === "actor") {
      setSelectedGenre(null)
      setSelectedTopic(null)
      setSelectedCountry(null)
      setSelectedMediaItem(null)
    } else {
      setSelectedGenre(null)
      setSelectedTopic(null)
      setSelectedCountry(null)
      setSelectedMediaItem(null)
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
  }

  const handleBackToTopics = () => {
    setCurrentPage("topics")
    setSelectedTopic(null)
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
      poster: getImageUrl(item.poster_path, "w500"),
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

  const featuredMovie = movieData.trending[0]

  return (
    <div className="app">
      <Header onNavigate={handleNavigate} />

      {currentPage === "home" && (
        <>
          {featuredMovie && <HeroSection movie={featuredMovie} movieGenres={genres} />}
          <div className="content">
            <RecentlyUpdatedSection />
            <MovieSection title="Trending Now" movies={convertToMovieFormat(movieData.trending.slice(1, 11))} />
            <MovieSection title="Popular Movies" movies={convertToMovieFormat(movieData.popularMovies)} />
            <MovieSection title="Now Playing" movies={convertToMovieFormat(movieData.nowPlaying)} />
            <MovieSection title="Popular TV Shows" movies={convertToMovieFormat(movieData.popularTVShows)} />
            <MovieSection title="Top Rated Movies" movies={convertToMovieFormat(movieData.topRatedMovies)} />
            <MovieSection
              title="Top Rated TV Shows"
              movies={convertToMovieFormat(movieData.topRatedTVShows)}
              rows={2}
            />
          </div>
        </>
      )}

      {currentPage === "topics" && <TopicContentPage onTopicSelect={handleTopicSelect} />}

      {currentPage === "topic-movies" && selectedTopic && (
        <TopicContentPage selectedTopic={selectedTopic} onBack={handleBackToTopics} />
      )}

      {currentPage === "genre-movies" && selectedGenre && (
        <GenreMoviesPage selectedGenre={selectedGenre} onBack={handleBackToHome} />
      )}

      {currentPage === "country-movies" && selectedCountry && (
        <CountryMoviesPage selectedCountry={selectedCountry} onBack={handleBackToHome} />
      )}

      {currentPage === "movies" && <MoviesPage onBack={handleBackToHome} />}

      {currentPage === "series" && <SeriesPage onBack={handleBackToHome} />}

      {currentPage === "actor" && <ActorsPage onBack={handleBackToHome} />}

      {currentPage === "movie-details" && selectedMediaItem && (
        <MovieDetailsPage mediaItem={selectedMediaItem} onBack={handleBackToHome} />
      )}
    </div>
  )
}

export default App
