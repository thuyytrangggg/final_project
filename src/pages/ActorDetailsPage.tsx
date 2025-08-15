"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { tmdbApi } from "../services/tmdbApi"
import { getImageUrl } from "../config/api"
import type { ActorDetails, Movie, TVShow } from "../types/mediaTypes"
import "./ActorDetailsPage.css"

interface ActorDetailsPageProps {
  actorId: number
  onBack: () => void
  onMovieClick?: (movieData: any) => void
}

const ActorDetailsPage: React.FC<ActorDetailsPageProps> = ({ actorId, onBack, onMovieClick }) => {
  const [actor, setActor] = useState<ActorDetails | null>(null)
  const [movies, setMovies] = useState<Movie[]>([])
  const [tvShows, setTvShows] = useState<TVShow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"movies" | "tv" | "bio">("movies")
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const fetchActorDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        const actorDetails = await tmdbApi.getActorDetails(actorId)
        setActor(actorDetails)

        if (actorDetails.movie_credits?.cast) {
          const sortedMovies = actorDetails.movie_credits.cast
            .filter((movie) => movie.id && movie.title) 
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, 50) 
          setMovies(sortedMovies)
        }

        if (actorDetails.tv_credits?.cast) {
          const sortedTVShows = actorDetails.tv_credits.cast
            .filter((show) => show.id && show.name) 
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, 50) 
          setTvShows(sortedTVShows)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch actor details")
        console.error("Error fetching actor details:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchActorDetails()
  }, [actorId])

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

  const handleContentClick = (item: Movie | TVShow, type: "movie" | "tv") => {
    if (onMovieClick) {
      const mediaItem = {
        id: item.id,
        title: type === "movie" ? (item as Movie).title : undefined,
        name: type === "tv" ? (item as TVShow).name : undefined,
        poster_path: item.poster_path || null,
        backdrop_path: item.backdrop_path || null,
        vote_average: item.vote_average || 0,
        release_date: type === "movie" ? (item as Movie).release_date || "" : undefined,
        first_air_date: type === "tv" ? (item as TVShow).first_air_date || "" : undefined,
        overview: item.overview || "",
        genre_ids: item.genre_ids || [],
        genres: item.genres || [],
        media_type: type as "movie" | "tv",
        adult: item.adult || false,
        original_language: item.original_language || "en",
        original_title: type === "movie" ? (item as Movie).original_title || (item as Movie).title : undefined,
        popularity: item.popularity || 0,
        vote_count: item.vote_count || 0,
        // Add character info for context
        character: (item as any).character || undefined,
      }

      console.log("Navigating to content details:", mediaItem)
      onMovieClick(mediaItem)
    }
  }

  const calculateAge = (birthday: string, deathday?: string) => {
    const birth = new Date(birthday)
    const end = deathday ? new Date(deathday) : new Date()
    const age = end.getFullYear() - birth.getFullYear()
    const monthDiff = end.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
      return age - 1
    }
    return age
  }

  if (loading) {
    return (
      <div className="actor-details-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading actor details...</p>
        </div>
      </div>
    )
  }

  if (error || !actor) {
    return (
      <div className="actor-details-container">
        <div className="error-state">
          <p>Error: {error || "Actor not found"}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  const currentContent = activeTab === "movies" ? movies : tvShows

  return (
    <div className="actor-details-container">
      {/* Hero Section */}
      <div className="actor-hero">
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

        <div className="actor-hero-content">
          <div className="actor-photo-section">
            <img
              src={getImageUrl(actor.profile_path, "w500") || "/placeholder.svg?height=600&width=400"}
              alt={actor.name}
              className="actor-photo-large"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=600&width=400"
              }}
            />
          </div>

          <div className="actor-info-section">
            <h1 className="actor-name">{actor.name}</h1>
            <p className="actor-department">{actor.known_for_department}</p>

            <div className="actor-stats">
              <div className="stat-item">
                <span className="stat-label">Popularity</span>
                <span className="stat-value">★ {actor.popularity.toFixed(1)}</span>
              </div>
              {actor.birthday && (
                <div className="stat-item">
                  <span className="stat-label">Age</span>
                  <span className="stat-value">{calculateAge(actor.birthday, actor.deathday)} years old</span>
                </div>
              )}
              {actor.place_of_birth && (
                <div className="stat-item">
                  <span className="stat-label">Born in</span>
                  <span className="stat-value">{actor.place_of_birth}</span>
                </div>
              )}
            </div>

            <div className="actor-counts">
              <div className="count-item">
                <span className="count-number">{movies.length}</span>
                <span className="count-label">Movies</span>
              </div>
              <div className="count-item">
                <span className="count-number">{tvShows.length}</span>
                <span className="count-label">TV Shows</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="actor-content">
        <div className="content-tabs">
          <button
            className={`tab-button ${activeTab === "movies" ? "active" : ""}`}
            onClick={() => setActiveTab("movies")}
          >
            Movies ({movies.length})
          </button>
          <button className={`tab-button ${activeTab === "tv" ? "active" : ""}`} onClick={() => setActiveTab("tv")}>
            TV Shows ({tvShows.length})
          </button>
          <button className={`tab-button ${activeTab === "bio" ? "active" : ""}`} onClick={() => setActiveTab("bio")}>
            Biography
          </button>
        </div>

        <div className="tab-content">
          {(activeTab === "movies" || activeTab === "tv") && (
            <div className="content-grid">
              {currentContent.map((item) => (
                <div
                  key={`${activeTab}-${item.id}`}
                  className="content-card"
                  onClick={() => handleContentClick(item, activeTab)}
                >
                  <div className="content-poster">
                    <img
                      src={getImageUrl(item.poster_path, "w500") || "/placeholder.svg?height=300&width=200"}
                      alt={activeTab === "movies" ? (item as Movie).title : (item as TVShow).name}
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=300&width=200"
                      }}
                    />
                    <div className="content-overlay">
                      <div className="content-overlay-inner">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        <span>View Details</span>
                      </div>
                    </div>
                  </div>
                  <div className="content-info">
                    <h3 className="content-title">
                      {activeTab === "movies" ? (item as Movie).title : (item as TVShow).name}
                    </h3>
                    <div className="content-meta">
                      <span className="content-year">
                        {activeTab === "movies"
                          ? (item as Movie).release_date
                            ? new Date((item as Movie).release_date).getFullYear()
                            : "N/A"
                          : (item as TVShow).first_air_date
                            ? new Date((item as TVShow).first_air_date).getFullYear()
                            : "N/A"}
                      </span>
                      <span className="content-rating">⭐ {item.vote_average?.toFixed(1) || "N/A"}</span>
                    </div>
                    <p className="character-name">as {(item as any).character || "Unknown Character"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "bio" && (
            <div className="biography-content">
              <div className="bio-section">
                <h3>Biography</h3>
                <p className="bio-text">{actor.biography || "No biography available for this actor."}</p>
              </div>

              {actor.also_known_as && actor.also_known_as.length > 0 && (
                <div className="bio-section">
                  <h3>Also Known As</h3>
                  <div className="also-known-as">
                    {actor.also_known_as.map((name, index) => (
                      <span key={index} className="aka-name">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bio-section">
                <h3>Personal Information</h3>
                <div className="personal-info">
                  {actor.birthday && (
                    <div className="info-row">
                      <span className="info-label">Birthday:</span>
                      <span className="info-value">
                        {new Date(actor.birthday).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  {actor.deathday && (
                    <div className="info-row">
                      <span className="info-label">Died:</span>
                      <span className="info-value">
                        {new Date(actor.deathday).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  {actor.place_of_birth && (
                    <div className="info-row">
                      <span className="info-label">Place of Birth:</span>
                      <span className="info-value">{actor.place_of_birth}</span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="info-label">Known For:</span>
                    <span className="info-value">{actor.known_for_department}</span>
                  </div>
                  {actor.gender && (
                    <div className="info-row">
                      <span className="info-label">Gender:</span>
                      <span className="info-value">
                        {actor.gender === 1 ? "Female" : actor.gender === 2 ? "Male" : "Other"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
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
    </div>
  )
}

export default ActorDetailsPage
