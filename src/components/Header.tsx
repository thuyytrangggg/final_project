"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearch } from "../hooks/useSearch"
import { getImageUrl } from "../config/api"
import type { Genre, MediaItem } from "../types/mediaTypes"
import "../styles/Header.css"
import GenreModal from "./GenreModal"
import CountryModal from "./CountryModal"

interface Country {
  iso_3166_1: string
  english_name: string
  native_name: string
}

interface HeaderProps {
  onNavigate: (page: string, data?: any) => void
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const { query, setQuery, results, loading } = useSearch()
  const [showResults, setShowResults] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeNav, setActiveNav] = useState("home")
  const [showGenreModal, setShowGenreModal] = useState(false)
  const [showCountryModal, setShowCountryModal] = useState(false)
  const [searchInput, setSearchInput] = useState("")

  const handleSearchFocus = () => {
    setShowResults(true)
  }

  const handleSearchBlur = () => {
    setTimeout(() => setShowResults(false), 200)
  }

  const handleResultClick = (item: MediaItem) => {
    console.log("Selected:", item)
    onNavigate("movie-details", { mediaItem: item })
    setShowResults(false)
    setQuery("")
    setSearchInput("")
    setActiveNav("movie-details")
  }

  const handleSearchSubmit = () => {
    if (searchInput.trim()) {
      onNavigate("search-results", { searchQuery: searchInput.trim() })
      setShowResults(false)
      setActiveNav("search-results")
    }
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearchSubmit()
    }
  }

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value)
    setQuery(value) // For dropdown results
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const handleLogoClick = () => {
    onNavigate("home")
    setActiveNav("home")
    setSearchInput("")
    setQuery("")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleNavLinkClick = (page: string) => {
    onNavigate(page)
    setActiveNav(page)
  }

  const handleGenreSelect = (genre: Genre) => {
    console.log("Genre selected:", genre)
    setActiveNav("genre")
    onNavigate("genre-movies", { selectedGenre: genre })
  }

  const handleCountrySelect = (country: Country) => {
    console.log("Country selected:", country)
    setActiveNav("country")
    onNavigate("country-movies", { selectedCountry: country })
  }

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <div className="header-left">
        <div className="logo" onClick={handleLogoClick}>
          <h1 className="logo-text">MOVIE</h1>
        </div>
        <nav className="nav">
          <a
            onClick={() => handleNavLinkClick("topics")}
            className={`nav-link ${activeNav === "topics" ? "active-nav-link" : ""}`}
          >
            Topic
          </a>
          <button
            onClick={() => setShowGenreModal(!showGenreModal)}
            className={`nav-link ${activeNav === "genre" ? "active-nav-link" : ""}`}
            style={{ position: "relative" }}
          >
            Genre
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 10L12 15L17 10H7Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {showGenreModal && (
              <GenreModal
                isOpen={showGenreModal}
                onClose={() => setShowGenreModal(false)}
                onGenreSelect={handleGenreSelect}
              />
            )}
          </button>
          <button
            onClick={() => setShowCountryModal(!showCountryModal)}
            className={`nav-link ${activeNav === "country" ? "active-nav-link" : ""}`}
            style={{ position: "relative" }}
          >
            Country
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 10L12 15L17 10H7Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {showCountryModal && (
              <CountryModal
                isOpen={showCountryModal}
                onClose={() => setShowCountryModal(false)}
                onCountrySelect={handleCountrySelect}
              />
            )}
          </button>
          <a
            onClick={() => handleNavLinkClick("movies")}
            className={`nav-link ${activeNav === "movies" ? "active-nav-link" : ""}`}
          >
            Movies
          </a>
          <a
            onClick={() => handleNavLinkClick("series")}
            className={`nav-link ${activeNav === "series" ? "active-nav-link" : ""}`}
          >
            Series
          </a>
          <a
            onClick={() => handleNavLinkClick("actor")}
            className={`nav-link ${activeNav === "actor" ? "active-nav-link" : ""}`}
          >
            Actor
          </a>
        </nav>
      </div>
      <div className="header-right">
        <div className="search-container">
          <input
            type="text"
            placeholder="Tìm kiếm phim, diễn viên"
            className="search-input"
            value={searchInput}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            onKeyPress={handleSearchKeyPress}
          />
          <button className="search-btn" onClick={handleSearchSubmit}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {showResults && query.length > 0 && (
            <div className="search-results">
              {loading && <div className="search-loading">Searching...</div>}
              {!loading && results.length === 0 && query.length > 0 && (
                <div className="search-no-results">No results found</div>
              )}
              {!loading && results.length > 0 && (
                <div className="search-items">
                  {results.map((item) => (
                    <div key={item.id} className="search-item" onClick={() => handleResultClick(item)}>
                      <img
                        src={getImageUrl(item.poster_path, "w185") || "/placeholder.svg"}
                        alt={item.title || item.name}
                        className="search-item-poster"
                      />
                      <div className="search-item-info">
                        <h4>{item.title || item.name}</h4>
                        <p>
                          {item.release_date || item.first_air_date} • ⭐ {item.vote_average?.toFixed(1)}
                        </p>
                        <span className="media-type">{item.media_type === "movie" ? "Movie" : "TV Show"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <button className="header-btn clock-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 7V12L15 13.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button className="header-btn language-btn">EN</button>
        <button className="header-btn profile-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </button>
      </div>
    </header>
  )
}

export default Header
