
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { tmdbApi } from "../services/tmdbApi"
import { getImageUrl } from "../config/api"
import type { Actor } from "../types/mediaTypes"
import "./ActorsPage.css"

interface ActorsPageProps {
  onBack: () => void
  onActorClick?: (actorId: number) => void
}

const ActorsPage: React.FC<ActorsPageProps> = ({ onBack, onActorClick }) => {
  const [actors, setActors] = useState<Actor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<"popular" | "trending_week" | "trending_day">("popular")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchInput, setSearchInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Actor[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const categories = [
    { key: "popular", label: "Popular", description: "Most popular actors and actresses" },
    { key: "trending_week", label: "Trending This Week", description: "Trending actors this week" },
    { key: "trending_day", label: "Trending Today", description: "Trending actors today" },
  ] as const

  useEffect(() => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
    }

    if (searchInput.trim().length > 0) {
      const timer = setTimeout(async () => {
        try {
          setSearchLoading(true)
          const results = await tmdbApi.searchActors(searchInput.trim(), 1)
          setSearchResults(results.slice(0, 8)) // Limit dropdown results
        } catch (err) {
          console.error("Search error:", err)
          setSearchResults([])
        } finally {
          setSearchLoading(false)
        }
      }, 300) // 300ms debounce

      setSearchDebounceTimer(timer)
    } else {
      setSearchResults([])
    }

    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer)
      }
    }
  }, [searchInput])

  useEffect(() => {
    const fetchActors = async () => {
      try {
        setLoading(true)
        setError(null)

        let response: Actor[] = []

        if (isSearching && searchQuery.trim()) {
          response = await tmdbApi.searchActors(searchQuery, page)
        } else {
          switch (activeCategory) {
            case "popular":
              response = await tmdbApi.getPopularActors(page)
              break
            case "trending_week":
              response = await tmdbApi.getTrendingActors("week", page)
              break
            case "trending_day":
              response = await tmdbApi.getTrendingActors("day", page)
              break
          }
        }

        if (page === 1) {
          setActors(response)
        } else {
          setActors((prev) => [...prev, ...response])
        }

        // Estimate total pages
        setTotalPages(Math.min(20, Math.ceil(response.length > 0 ? 500 / 20 : 1)))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch actors")
        console.error("Error fetching actors:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchActors()
  }, [activeCategory, page, searchQuery, isSearching])

  useEffect(() => {
    // Reset page when switching categories or searching
    setPage(1)
  }, [activeCategory, searchQuery])

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value)
  }

  const handleSearchFocus = () => {
    if (searchInput.trim().length > 0) {
      setShowSearchResults(true)
    }
  }

  const handleSearchBlur = () => {
    setTimeout(() => setShowSearchResults(false), 200)
  }

  const handleSearchSubmit = () => {
    if (searchInput.trim()) {
      setSearchQuery(searchInput.trim())
      setIsSearching(true)
      setShowSearchResults(false)
      setPage(1)
    }
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearchSubmit()
    }
  }

  const handleSearchResultClick = (actor: Actor) => {
    handleActorClick(actor)
    setShowSearchResults(false)
    setSearchInput("")
    setSearchQuery("")
    setIsSearching(false)
  }

  const clearSearch = () => {
    setSearchInput("")
    setSearchQuery("")
    setIsSearching(false)
    setPage(1)
    setShowSearchResults(false)
  }

  const loadMore = () => {
    if (page < totalPages && !loading) {
      setPage((prev) => prev + 1)
    }
  }

  const handleActorClick = (actor: Actor) => {
    console.log("Selected actor:", actor)
    if (onActorClick) {
      onActorClick(actor.id)
    }
  }

  const currentCategory = categories.find((cat) => cat.key === activeCategory)

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

  if (loading && page === 1) {
    return (
      <div className="actors-page-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading actors...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="actors-page-container">
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="actors-page-container">
      <div className="actors-header">
        <h1 className="actors-title">Actors</h1>
      </div>

      <div className="search-section">
        <div className="search-container-actor">
          <input
            type="text"
            placeholder="Search for actors..."
            className="search-input-actor"
            value={searchInput}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            onKeyPress={handleSearchKeyPress}
          />
          <button className="search-btn-actor" onClick={handleSearchSubmit}>
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
          {(searchInput || isSearching) && (
            <button className="clear-search-btn-actor" onClick={clearSearch}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}

          {showSearchResults && searchInput.length > 0 && (
            <div className="search-results-dropdown">
              {searchLoading && <div className="search-loading">Searching...</div>}
              {!searchLoading && searchResults.length === 0 && searchInput.length > 0 && (
                <div className="search-no-results">No actors found</div>
              )}
              {!searchLoading && searchResults.length > 0 && (
                <div className="search-items">
                  {searchResults.map((actor) => (
                    <div key={actor.id} className="search-item" onClick={() => handleSearchResultClick(actor)}>
                      <img
                        src={getImageUrl(actor.profile_path, "w185") || "/placeholder.svg?height=60&width=45"}
                        alt={actor.name}
                        className="search-item-poster"
                      />
                      <div className="search-item-info">
                        <h4>{actor.name}</h4>
                        <p>
                          {actor.known_for_department} • ★ {actor.popularity.toFixed(1)}
                        </p>
                        <span className="media-type">Actor</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!isSearching && (
        <div className="category-tabs">
          {categories.map((category) => (
            <button
              key={category.key}
              className={`category-tab ${activeCategory === category.key ? "active" : ""}`}
              onClick={() => setActiveCategory(category.key)}
            >
              <span className="category-label">{category.label}</span>
              <span className="category-description">{category.description}</span>
            </button>
          ))}
        </div>
      )}

      <div className="current-category-info">
        {/* <h2 className="category-title-actor">
          {isSearching ? `Search Results for "${searchQuery}"` : currentCategory?.label}
        </h2> */}
      </div>

      <div className="actors-grid">
        {actors.map((actor) => (
          <div key={actor.id} className="actor-card" onClick={() => handleActorClick(actor)}>
            <div className="actor-photo">
              <img
                src={getImageUrl(actor.profile_path, "w185") || "/placeholder.svg?height=250&width=200"}
                alt={actor.name}
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=250&width=200"
                }}
              />
              <div className="actor-overlay">
                <div className="actor-info-overlay">
                  <span className="actor-department">{actor.known_for_department}</span>
                  <span className="actor-popularity">★ {actor.popularity.toFixed(1)}</span>
                </div>
              </div>
            </div>
            <div className="actor-info">
              <h3 className="actors-name">{actor.name}</h3>
              {/* <p className="actor-department">{actor.known_for_department}</p> */}
              <div className="actor-known-for">
                {actor.known_for?.slice(0, 2).map((item, index) => (
                  <span key={index} className="known-for-item">
                    {item.title || item.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {actors.length > 0 && page < totalPages && (
        <div className="load-more-container">
          <button className="load-more-btn-actor" onClick={loadMore} disabled={loading}>
            {loading ? (
              <>
                <div className="loading-spinner small"></div>
              </>
            ) : (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
            )}
          </button>
        </div>
      )}

      {actors.length === 0 && !loading && (
        <div className="no-actors">
          <p>{isSearching ? `No actors found for "${searchQuery}"` : "No actors found in this category."}</p>
        </div>
      )}
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

export default ActorsPage
