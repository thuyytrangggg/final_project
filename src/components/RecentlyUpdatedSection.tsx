"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { tmdbApi } from "../services/tmdbApi"
import { getImageUrl } from "../config/api"
import type { TVShow } from "../types/mediaTypes"
import "../styles/RecentlyUpdatedSection.css"

interface RecentItem {
  id: number
  title: string
  subtitle: string
  poster: string
  time: string
  first_air_date?: string
}

interface RecentlyUpdatedSectionProps {
  onItemClick?: (item: any) => void
}

const RecentlyUpdatedSection: React.FC<RecentlyUpdatedSectionProps> = ({ onItemClick }) => {
  const [recentItems, setRecentItems] = useState<RecentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecentlyUpdated = async () => {
      try {
        setLoading(true)
        setError(null)

        const tvShows = await tmdbApi.getPopularTVShows(1)

        const transformedItems: RecentItem[] = tvShows.slice(0, 6).map((show: TVShow, index) => {
          const seasonNum = Math.floor(Math.random() * 5) + 1
          const episodeNum = Math.floor(Math.random() * 12) + 1

          const daysAgo = Math.floor(Math.random() * 30) + 1
          const date = new Date()
          date.setDate(date.getDate() - daysAgo)
          const formattedDate = date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          })

          return {
            id: show.id,
            title: show.name || "Unknown Title",
            subtitle: `Season ${seasonNum}, Ep ${episodeNum}`,
            poster: getImageUrl(show.poster_path, "w185"),
            time: formattedDate,
            first_air_date: show.first_air_date,
          }
        })

        setRecentItems(transformedItems)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data")
        console.error("Error fetching recently updated:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentlyUpdated()
  }, [])

  const handleItemClick = (item: RecentItem) => {
    if (onItemClick) {
      const mediaItem = {
        id: item.id,
        title: item.title,
        name: item.title,
        poster_path: item.poster?.includes("placeholder") ? null : extractPosterPath(item.poster),
        backdrop_path: null,
        vote_average: 7.5, 
        release_date: item.first_air_date || "2023-01-01",
        first_air_date: item.first_air_date || "2023-01-01",
        overview: `${item.title} - ${item.subtitle}`,
        genre_ids: [],
        genres: [],
        media_type: "tv" as const,
        adult: false,
        original_language: "en",
        original_title: item.title,
        popularity: 500,
        vote_count: 1000,
      }
      onItemClick(mediaItem)
    }
  }

  const extractPosterPath = (posterUrl: string): string | null => {
    if (!posterUrl || posterUrl.includes("placeholder")) return null
    const match = posterUrl.match(/\/w\d+(.+)$/)
    return match ? match[1] : null
  }

  if (loading) {
    return (
      <div className="recently-updated-section">
        <div className="section-header">
          <h2 className="section-title">Recently Updated</h2>
        </div>
        <div className="recent-container">
          <div className="recent-items">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="recent-item loading">
                <div className="recent-poster skeleton"></div>
                <div className="recent-info">
                  <div className="skeleton-text skeleton-title"></div>
                  <div className="skeleton-text skeleton-subtitle"></div>
                  <div className="skeleton-text skeleton-time"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="recently-updated-section">
        <div className="section-header">
          <h2 className="section-title">Recently Updated</h2>
        </div>
        <div className="error-message">
          <p>Failed to load recently updated content</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="recently-updated-section">
      <div className="section-header">
        <h2 className="section-title">Recently Updated</h2>
      </div>
      <div className="recent-container">
        <div className="recent-items">
          {recentItems.map((item) => (
            <div key={item.id} className="recent-item" onClick={() => handleItemClick(item)}>
              <div className="recent-poster">
                <img
                  src={item.poster || "/placeholder.svg?height=60&width=45"}
                  alt={item.title}
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=60&width=45"
                  }}
                />
              </div>
              <div className="recent-info">
                <h3 className="recent-title">{item.title}</h3>
                <p className="recent-subtitle">{item.subtitle}</p>
                <p className="recent-time">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="nav-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default RecentlyUpdatedSection
