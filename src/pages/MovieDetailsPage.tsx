"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { tmdbApi } from "../services/tmdbApi"
import { getImageUrl, formatDate, formatRuntime } from "../config/api"
import type { MovieDetails, TVShow, MediaItem, Cast, Video } from "../types/mediaTypes"
import "./MovieDetailsPage.css"

interface MovieDetailsPageProps {
  mediaItem: MediaItem
  onBack: () => void
}

const MovieDetailsPage: React.FC<MovieDetailsPageProps> = ({ mediaItem, onBack }) => {
  const [details, setDetails] = useState<MovieDetails | TVShow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "cast" | "videos">("overview")

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        let response
        if (mediaItem.media_type === "movie") {
          response = await tmdbApi.getMovieDetails(mediaItem.id)
        } else {
          response = await tmdbApi.getTVShowDetails(mediaItem.id)
        }

        setDetails(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch details")
        console.error("Error fetching details:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [mediaItem])

  if (loading) {
    return (
      <div className="movie-details-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading movie details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="movie-details-container">
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  const isMovie = mediaItem.media_type === "movie"
  const title = isMovie ? (mediaItem as any).title : (mediaItem as any).name
  const releaseDate = isMovie ? (mediaItem as any).release_date : (mediaItem as any).first_air_date
  const backdropUrl = getImageUrl(mediaItem.backdrop_path, "w1280")
  const posterUrl = getImageUrl(mediaItem.poster_path, "w500")

  const renderOverview = () => (
    <div className="overview-content">
      <div className="movie-poster-section">
        <img
          src={posterUrl || "/placeholder.svg?height=600&width=400"}
          alt={title}
          className="movie-poster-large"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg?height=600&width=400"
          }}
        />
        <div className="movie-actions">
          <button className="watch-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch Now
          </button>
          <button className="watchlist-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
            </svg>
            Add to Watchlist
          </button>
        </div>
      </div>
      <div className="movie-info-section">
        <div className="movie-metadata">
          <div className="metadata-row">
            <span className="metadata-label">Release Date:</span>
            <span className="metadata-value">{releaseDate ? formatDate(releaseDate) : "N/A"}</span>
          </div>
          <div className="metadata-row">
            <span className="metadata-label">Rating:</span>
            <span className="metadata-value">⭐ {mediaItem.vote_average?.toFixed(1) || "N/A"}</span>
          </div>
          <div className="metadata-row">
            <span className="metadata-label">Popularity:</span>
            <span className="metadata-value">{mediaItem.popularity?.toFixed(0) || "N/A"}</span>
          </div>
          {details && "runtime" in details && details.runtime && (
            <div className="metadata-row">
              <span className="metadata-label">Runtime:</span>
              <span className="metadata-value">{formatRuntime(details.runtime)}</span>
            </div>
          )}
          {details && "genres" in details && details.genres && (
            <div className="metadata-row">
              <span className="metadata-label">Genres:</span>
              <div className="genres-list">
                {details.genres.map((genre) => (
                  <span key={genre.id} className="genre-tag">
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="movie-description">
          <h3>Overview</h3>
          <p>{mediaItem.overview || "No overview available."}</p>
        </div>
        {details && "production_companies" in details && details.production_companies && (
          <div className="production-companies">
            <h3>Production Companies</h3>
            <div className="companies-list">
              {details.production_companies.slice(0, 6).map((company) => (
                <div key={company.id} className="company-item">
                  {company.logo_path && (
                    <img
                      src={getImageUrl(company.logo_path, "w92") || "/placeholder.svg"}
                      alt={company.name}
                      className="company-logo"
                    />
                  )}
                  <span className="company-name">{company.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderCast = () => {
    if (!details || !("credits" in details) || !details.credits?.cast) {
      return <div className="no-data">No cast information available.</div>
    }

    return (
      <div className="cast-grid">
        {details.credits.cast.slice(0, 20).map((actor: Cast) => (
          <div key={actor.id} className="cast-card">
            <img
              src={getImageUrl(actor.profile_path, "w185") || "/placeholder.svg?height=250&width=200"}
              alt={actor.name}
              className="cast-photo"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=250&width=200"
              }}
            />
            <div className="cast-info">
              <h4 className="cast-name">{actor.name}</h4>
              <p className="cast-character">{actor.character}</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderVideos = () => {
    if (!details || !("videos" in details) || !details.videos?.results) {
      return <div className="no-data">No videos available.</div>
    }

    const trailers = details.videos.results.filter(
      (video: Video) => video.site === "YouTube" && (video.type === "Trailer" || video.type === "Teaser"),
    )

    if (trailers.length === 0) {
      return <div className="no-data">No trailers available.</div>
    }

    return (
      <div className="videos-grid">
        {trailers.slice(0, 8).map((video: Video) => (
          <div key={video.id} className="video-card">
            <div className="video-thumbnail">
              <img
                src={`https://img.youtube.com/vi/${video.key}/hqdefault.jpg`}
                alt={video.name}
                className="thumbnail-image"
              />
              <button
                className="play-button"
                onClick={() => window.open(`https://www.youtube.com/watch?v=${video.key}`, "_blank")}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
            <h4 className="video-title">{video.name}</h4>
            <p className="video-type">{video.type}</p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="movie-details-container">
      {/* Hero Section */}
      <div
        className="hero-section"
        style={{
          backgroundImage: `url(${backdropUrl || "/placeholder.svg?height=500&width=1200"})`,
        }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content">
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
          <div className="hero-info">
            <h1 className="hero-title">{title}</h1>
            <div className="hero-metadata">
              <span className="media-type-badge">{isMovie ? "Movie" : "TV Show"}</span>
              <span className="release-year">{releaseDate ? new Date(releaseDate).getFullYear() : "N/A"}</span>
              <span className="rating">⭐ {mediaItem.vote_average?.toFixed(1) || "N/A"}</span>
              {details && "runtime" in details && details.runtime && (
                <span className="runtime">⏱ {formatRuntime(details.runtime)}</span>
              )}
            </div>
            <p className="hero-overview">{mediaItem.overview?.substring(0, 200) + "..." || "No overview available."}</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="content-section">
        <div className="tabs-container">
          <div className="tabs">
            <button
              className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`tab-button ${activeTab === "cast" ? "active" : ""}`}
              onClick={() => setActiveTab("cast")}
            >
              Cast & Crew
            </button>
            <button
              className={`tab-button ${activeTab === "videos" ? "active" : ""}`}
              onClick={() => setActiveTab("videos")}
            >
              Videos & Trailers
            </button>
          </div>
        </div>

        <div className="tab-content">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "cast" && renderCast()}
          {activeTab === "videos" && renderVideos()}
        </div>
      </div>
    </div>
  )
}

export default MovieDetailsPage
