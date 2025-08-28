"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { tmdbApi } from "../services/tmdbApi"
import { getImageUrl } from "../config/api"
import type { MovieDetails, TVShow, MediaItem } from "../types/mediaTypes"
import { ChevronLeft, ChevronRight } from "lucide-react"
import "./MoviePlayerPage.css"

interface MoviePlayerPageProps {
  mediaItem: MediaItem
  onBack: () => void
  onMovieClick?: (movie: MediaItem) => void
}

const MoviePlayerPage: React.FC<MoviePlayerPageProps> = ({ mediaItem, onBack, onMovieClick }) => {
  const [details, setDetails] = useState<MovieDetails | TVShow | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [selectedEpisode, setSelectedEpisode] = useState(1)
  const [seasons, setSeasons] = useState<any[]>([])
  const [episodes, setEpisodes] = useState<any[]>([])
  const [seasonsLoading, setSeasonsLoading] = useState(false)
  const [episodesLoading, setEpisodesLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(100)
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [quality, setQuality] = useState("1080p")
  const [showSettings, setShowSettings] = useState(false)
  const [recommendations, setRecommendations] = useState<MediaItem[]>([])
  const [recommendationsLoading, setRecommendationsLoading] = useState(true)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isMovie = mediaItem.media_type === "movie" // Moved declaration here

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true)
        let response
        if (isMovie) {
          response = await tmdbApi.getMovieDetails(mediaItem.id)
        } else {
          response = await tmdbApi.getTVShowDetails(mediaItem.id)
          if (response.number_of_seasons) {
            const seasonsData = []
            for (let i = 1; i <= response.number_of_seasons; i++) {
              seasonsData.push({ season_number: i, name: `Season ${i}` })
            }
            setSeasons(seasonsData)
          }
        }
        setDetails(response)
      } catch (err) {
        console.error("Error fetching details:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [mediaItem])

  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!isMovie && details) {
        try {
          setEpisodesLoading(true)
          const seasonData = await tmdbApi.getTVSeasonDetails(mediaItem.id, selectedSeason)
          setEpisodes(seasonData.episodes || [])
        } catch (err) {
          console.error("Error fetching episodes:", err)
          const mockEpisodes = [
            {
              id: 1,
              name: "Episode 1: The Beginning",
              overview: "The story begins as our characters are introduced to a world of mystery and adventure.",
              still_path: "/episode1.png",
              episode_number: 1,
              runtime: 45,
            },
            {
              id: 2,
              name: "Episode 2: The Journey",
              overview: "Our heroes embark on their first major quest, facing unexpected challenges.",
              still_path: "/episode2.png",
              episode_number: 2,
              runtime: 42,
            },
            {
              id: 3,
              name: "Episode 3: The Discovery",
              overview: "A shocking revelation changes everything the characters thought they knew.",
              still_path: "/episode3.png",
              episode_number: 3,
              runtime: 48,
            },
          ]
          setEpisodes(mockEpisodes)
        } finally {
          setEpisodesLoading(false)
        }
      }
    }

    fetchEpisodes()
  }, [selectedSeason, details, mediaItem.id])

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setRecommendationsLoading(true)
        let recommendationsData
        if (isMovie) {
          recommendationsData = await tmdbApi.getMovieRecommendations(mediaItem.id)
        } else {
          recommendationsData = await tmdbApi.getTVRecommendations(mediaItem.id)
        }

        const mappedRecommendations = recommendationsData.map((item: any) => ({
          id: item.id,
          title: item.title || item.name || "",
          name: item.name || "",
          poster_path: item.poster_path,
          backdrop_path: item.backdrop_path,
          vote_average: item.vote_average || 0,
          release_date: item.release_date || "",
          first_air_date: item.first_air_date || "",
          overview: item.overview || "",
          genre_ids: item.genre_ids || [],
          genres: item.genres || [],
          media_type: mediaItem.media_type,
          adult: item.adult || false,
          original_language: item.original_language || "",
          original_title: item.original_title || "",
          original_name: item.original_name || "",
          popularity: item.popularity || 0,
          vote_count: item.vote_count || 0,
        }))

        setRecommendations(mappedRecommendations.slice(0, 15))
      } catch (err) {
        console.error("Error fetching recommendations:", err)
        const fallbackData =
          mediaItem.media_type === "tv"
            ? [
                {
                  id: 1,
                  title: "Breaking Bad",
                  name: "Breaking Bad",
                  poster_path: "/movie1.png",
                  vote_average: 9.5,
                  media_type: "tv",
                },
                {
                  id: 2,
                  title: "Stranger Things",
                  name: "Stranger Things",
                  poster_path: "/movie2.png",
                  vote_average: 8.7,
                  media_type: "tv",
                },
                {
                  id: 3,
                  title: "The Crown",
                  name: "The Crown",
                  poster_path: "/movie3.png",
                  vote_average: 8.6,
                  media_type: "tv",
                },
                {
                  id: 4,
                  title: "Game of Thrones",
                  name: "Game of Thrones",
                  poster_path: "/movie4.png",
                  vote_average: 9.3,
                  media_type: "tv",
                },
                {
                  id: 5,
                  title: "The Office",
                  name: "The Office",
                  poster_path: "/movie5.png",
                  vote_average: 8.9,
                  media_type: "tv",
                },
                {
                  id: 6,
                  title: "Friends",
                  name: "Friends",
                  poster_path: "/movie6.png",
                  vote_average: 8.9,
                  media_type: "tv",
                },
              ]
            : [
                { id: 1, title: "Similar Movie 1", poster_path: "/movie1.png", vote_average: 8.1, media_type: "movie" },
                { id: 2, title: "Similar Movie 2", poster_path: "/movie2.png", vote_average: 7.8, media_type: "movie" },
                { id: 3, title: "Similar Movie 3", poster_path: "/movie3.png", vote_average: 8.3, media_type: "movie" },
                { id: 4, title: "Similar Movie 4", poster_path: "/movie4.png", vote_average: 7.6, media_type: "movie" },
                { id: 5, title: "Similar Movie 5", poster_path: "/movie5.png", vote_average: 8.9, media_type: "movie" },
                { id: 6, title: "Similar Movie 6", poster_path: "/movie6.png", vote_average: 7.4, media_type: "movie" },
              ]

        setRecommendations(fallbackData as MediaItem[])
      } finally {
        setRecommendationsLoading(false)
      }
    }

    fetchRecommendations()
  }, [mediaItem])

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })

      setTimeout(() => {
        checkScrollability()
      }, 600)
    }
  }

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current

      setCanScrollLeft(scrollLeft > 5)

      const maxScrollLeft = scrollWidth - clientWidth
      setCanScrollRight(scrollLeft < maxScrollLeft - 5)
    }
  }

  useEffect(() => {
    checkScrollability()
  }, [recommendations])

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScrollability)
      window.addEventListener("resize", checkScrollability)

      return () => {
        scrollContainer.removeEventListener("scroll", checkScrollability)
        window.removeEventListener("resize", checkScrollability)
      }
    }
  }, [])

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "f" || event.key === "F") {
        event.preventDefault()
        handleFullscreenToggle()
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => {
      document.removeEventListener("keydown", handleKeyPress)
    }
  }, [isFullscreen])

  const title = isMovie
    ? (details as MovieDetails)?.title || mediaItem.title
    : (details as TVShow)?.name || mediaItem.name

  const posterUrl =
    details?.poster_path || mediaItem.poster_path
      ? getImageUrl(details?.poster_path || mediaItem.poster_path, "w500")
      : "/placeholder.svg?height=600&width=400"

  const backdropUrl =
    details?.backdrop_path || mediaItem.backdrop_path
      ? getImageUrl(details?.backdrop_path || mediaItem.backdrop_path, "w1280")
      : "/placeholder.svg?height=500&width=1200"

  const mockNewReleases = [
    { id: 1, title: "New Release 1", poster: "/movie1.png", rating: 8.5 },
    { id: 2, title: "New Release 2", poster: "/movie2.png", rating: 7.8 },
    { id: 3, title: "New Release 3", poster: "/movie3.png", rating: 8.2 },
    { id: 4, title: "New Release 4", poster: "/movie4.png", rating: 7.9 },
  ]

  const mockHighRated = [
    { id: 1, title: "High Rated 1", poster: "/movie5.png", rating: 9.2 },
    { id: 2, title: "High Rated 2", poster: "/movie6.png", rating: 9.0 },
    { id: 3, title: "High Rated 3", poster: "/movie1.png", rating: 8.8 },
    { id: 4, title: "High Rated 4", poster: "/movie2.png", rating: 8.9 },
  ]

  const mockSameGenre = [
    { id: 1, title: "Same Genre 1", poster: "/movie3.png", rating: 8.1 },
    { id: 2, title: "Same Genre 2", poster: "/movie4.png", rating: 7.7 },
    { id: 3, title: "Same Genre 3", poster: "/movie5.png", rating: 8.3 },
    { id: 4, title: "Same Genre 4", poster: "/movie6.png", rating: 7.6 },
  ]

  const mockComments = [
    {
      id: 1,
      user: "MovieLover123",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 5,
      date: "2024-01-15",
      comment:
        "Amazing movie! The cinematography was breathtaking and the story kept me engaged throughout. Highly recommend!",
    },
    {
      id: 2,
      user: "CinemaFan",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4,
      date: "2024-01-12",
      comment: "Great acting and solid plot. Some pacing issues in the middle but overall a very enjoyable watch.",
    },
    {
      id: 3,
      user: "FilmCritic2024",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 5,
      date: "2024-01-10",
      comment:
        "This is exactly what cinema should be. Brilliant direction, outstanding performances, and a story that stays with you long after the credits roll.",
    },
    {
      id: 4,
      user: "WatcherDaily",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 3,
      date: "2024-01-08",
      comment:
        "Decent movie but felt a bit predictable. The visuals were stunning though, and the soundtrack was perfect.",
    },
  ]

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleSkipBackward = () => {
    setCurrentTime(Math.max(0, currentTime - 5))
  }

  const handleSkipForward = () => {
    setCurrentTime(Math.min(duration, currentTime + 5))
  }

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted)
  }

  const handleFullscreenToggle = () => {
    const videoSection = document.querySelector(".video-player-section") as HTMLElement
    if (!document.fullscreenElement) {
      if (videoSection.requestFullscreen) {
        videoSection.requestFullscreen()
      } else if ((videoSection as any).webkitRequestFullscreen) {
        // Safari
        ;(videoSection as any).webkitRequestFullscreen()
      } else if ((videoSection as any).msRequestFullscreen) {
        // IE/Edge cũ
        ;(videoSection as any).msRequestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        ;(document as any).webkitExitFullscreen()
      } else if ((document as any).msExitFullscreen) {
        ;(document as any).msExitFullscreen()
      }
    }
  }

  const handleQualityChange = (newQuality: string) => {
    setQuality(newQuality)
    setShowSettings(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleMovieClick = (movie: MediaItem) => {
    if (onMovieClick) {
      onMovieClick(movie)
    }
  }

  if (loading) {
    return (
      <div className="player-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading player...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="player-container">
      {/* Video Player Section */}
      <div className={`video-player-section ${isFullscreen ? "fullscreen" : ""}`}>
        <div className="video-player" style={{ backgroundImage: `url(${backdropUrl})` }}>
          <div className="video-overlay"></div>

          {/* Back Button */}
          <button className="player-back-button" onClick={onBack}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="24"
              viewBox="0 0 28 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="6" y1="12" x2="24" y2="12" />
              <polyline points="14 6 6 12 14 18" />
            </svg>
          </button>

          {/* Video Controls */}
          <div className="video-controls">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
            </div>
            <div className="controls-row">
              <div className="controls-left">
                <button className="control-button" onClick={handlePlayPause}>
                  {isPlaying ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                <button className="control-button" onClick={handleSkipBackward} title="Skip backward 5s">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M11 19l-7-7 7-7m8 14l-6 6M17 9l6 6" />
                    <text x="12" y="16" fontSize="8" fill="currentColor">
                      5
                    </text>
                  </svg>
                </button>
                <button className="control-button" onClick={handleSkipForward} title="Skip forward 5s">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M13 19l7-7-7-7M5 19l7-7-7-7" />
                    <text x="12" y="16" fontSize="8" fill="currentColor">
                      5
                    </text>
                  </svg>
                </button>
                <span className="time-display">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              <div className="controls-right">
                <button className="control-button" onClick={handleVolumeToggle} title="Volume">
                  {isMuted || volume === 0 ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  ) : volume < 50 ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  )}
                </button>
                <div className="settings-container">
                  <button className="control-button" onClick={() => setShowSettings(!showSettings)} title="Settings">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                  </button>
                  {showSettings && (
                    <div className="settings-dropdown">
                      <div className="settings-section">
                        <h4>Quality</h4>
                        <div className="quality-options">
                          {["4K", "1080p", "720p", "480p", "Auto"].map((q) => (
                            <button
                              key={q}
                              className={`quality-option ${quality === q ? "active" : ""}`}
                              onClick={() => handleQualityChange(q)}
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button className="control-button" onClick={handleFullscreenToggle} title="Fullscreen (F)">
                  {isFullscreen ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      {!isFullscreen && (
        <div className="player-content">
          <div className="movie-info-section">
            <div className="movie-poster-container">
              <img src={posterUrl || "/placeholder.svg"} alt={title} className="movie-poster" />
            </div>

            <div className="movie-center-details">
              <h1 className="movie-title">{title}</h1>

              <div className="movie-badges">
                <span className="imdb-badge">IMDb {(details?.vote_average || mediaItem.vote_average)?.toFixed(1)}</span>
                <span className="year-badge">
                  {details && "release_date" in details
                    ? new Date(details.release_date || "").getFullYear()
                    : new Date((details as TVShow)?.first_air_date || "").getFullYear()}
                </span>
                <span className="duration-badge">
                  {isMovie
                    ? `${(details as MovieDetails)?.runtime || 120}m`
                    : `${(details as TVShow)?.number_of_seasons || 1} Season${(details as TVShow)?.number_of_seasons !== 1 ? "s" : ""}`}
                </span>
              </div>

              <div className="movie-genres">
                {details?.genres?.map((genre) => (
                  <span key={genre.id} className="genre-tag">
                    {genre.name}
                  </span>
                )) || (
                  <>
                    <span className="genre-tag">Chiều Rạp</span>
                    <span className="genre-tag">Gia Đình</span>
                    <span className="genre-tag">Khoa Học</span>
                    <span className="genre-tag">Thiếu Nhi</span>
                    <span className="genre-tag">Hài</span>
                    <span className="genre-tag">Hoạt Hình</span>
                    <span className="genre-tag">Phiêu Lưu</span>
                  </>
                )}
              </div>
            </div>

            <div className="movie-description">
              <p className="movie-overview">{details?.overview || mediaItem.overview || "No overview available."}</p>
            </div>
          </div>

          {/* Episodes Section (for TV shows) */}
          {!isMovie && (
            <div className="episodes-section">
              <div className="season-selector">
                <label htmlFor="season-select">Season</label>
                <select
                  id="season-select"
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(Number(e.target.value))}
                >
                  {seasons.map((season) => (
                    <option key={season.season_number} value={season.season_number}>
                      {season.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="episodes-grid">
                {episodesLoading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading episodes...</p>
                  </div>
                ) : (
                  episodes.map((episode) => (
                    <div
                      key={episode.id}
                      className={`episode-card ${selectedEpisode === episode.episode_number ? "active" : ""}`}
                      onClick={() => setSelectedEpisode(episode.episode_number)}
                    >
                      <div className="episode-number-badge">{episode.episode_number}</div>
                      <div className="episode-thumbnail">
                        <img
                          src={episode.still_path ? getImageUrl(episode.still_path, "w300") : "/placeholder.svg"}
                          alt={episode.name}
                        />
                        <div className="episode-play-overlay">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="episode-title">{episode.name}</h3>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="recommendations-section">
            <h2 className="section-title">You may also like</h2>
            {recommendationsLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading recommendations...</p>
              </div>
            ) : (
              <div className="recent-container">
                {canScrollLeft && (
                  <button className="nav-arrow left-arrow" onClick={() => scroll("left")}>
                    <ChevronLeft strokeWidth={3} />
                  </button>
                )}
                <div className="recent-items" ref={scrollContainerRef}>
                  {recommendations.map((item) => (
                    <div
                      key={item.id}
                      className="recent-item"
                      onClick={() => handleMovieClick(item)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="recent-poster">
                        <img
                          src={getImageUrl(item.poster_path, "w300") || "/placeholder.svg"}
                          alt={item.title || item.name}
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=300&width=200"
                          }}
                        />
                        <div className="rating-badge">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                              fill="#FFC107"
                              stroke="#FFC107"
                              strokeWidth="1"
                            />
                          </svg>
                          <span className="rating-value">
                            {item.vote_average ? item.vote_average.toFixed(1) : "8.0"}
                          </span>
                        </div>
                      </div>
                      <p className="recent-title-below">{item.title || item.name}</p>
                    </div>
                  ))}
                </div>
                {canScrollRight && (
                  <button className="nav-arrow right-arrow" onClick={() => scroll("right")}>
                    <ChevronRight strokeWidth={3} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="comments-section">
            <h2>Comments</h2>
            <div className="add-comment">
              <h3>Add your comment</h3>
              <div className="comment-form">
                <textarea placeholder="Write your comment here..." className="comment-textarea" rows={4} />
                <button className="submit-comment">Post Comment</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MoviePlayerPage
