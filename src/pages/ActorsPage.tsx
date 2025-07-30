"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { tmdbApi } from "../services/tmdbApi"
import { getImageUrl } from "../config/api"
import type { Actor } from "../types/mediaTypes"
import "./ActorsPage.css"

interface ActorsPageProps {
  onBack: () => void
}

const ActorsPage: React.FC<ActorsPageProps> = ({ onBack }) => {
  const [actors, setActors] = useState<Actor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<"popular" | "trending_week" | "trending_day">("popular")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const categories = [
    { key: "popular", label: "Popular", description: "Most popular actors and actresses" },
    { key: "trending_week", label: "Trending This Week", description: "Trending actors this week" },
    { key: "trending_day", label: "Trending Today", description: "Trending actors today" },
  ] as const

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

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setIsSearching(query.trim().length > 0)
    setPage(1)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setIsSearching(false)
    setPage(1)
  }

  const loadMore = () => {
    if (page < totalPages && !loading) {
      setPage((prev) => prev + 1)
    }
  }

  const handleActorClick = (actor: Actor) => {
    console.log("Selected actor:", actor)
    // TODO: Navigate to actor details page
  }

  const currentCategory = categories.find((cat) => cat.key === activeCategory)

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

      <div className="actors-header">
        <h1 className="actors-title">Actors & Actresses</h1>
        <p className="actors-subtitle">Discover talented actors and actresses from around the world</p>
      </div>

      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search for actors..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <button className="search-btn">
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
          {searchQuery && (
            <button className="clear-search-btn" onClick={clearSearch}>
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
        <h2 className="category-title">
          {isSearching ? `Search Results for "${searchQuery}"` : currentCategory?.label}
        </h2>
        <p className="category-subtitle">
          {isSearching ? `Found ${actors.length} actors` : currentCategory?.description}
        </p>
        <span className="actors-count">({actors.length} actors)</span>
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
              <h3 className="actor-name">{actor.name}</h3>
              <p className="actor-department">{actor.known_for_department}</p>
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
          <button className="load-more-btn" onClick={loadMore} disabled={loading}>
            {loading ? (
              <>
                <div className="loading-spinner small"></div>
                Loading...
              </>
            ) : (
              "Load More Actors"
            )}
          </button>
        </div>
      )}

      {actors.length === 0 && !loading && (
        <div className="no-actors">
          <p>{isSearching ? `No actors found for "${searchQuery}"` : "No actors found in this category."}</p>
        </div>
      )}
    </div>
  )
}

export default ActorsPage
