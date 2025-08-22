"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getImageUrl } from "../config/api"
import { topicsData, type TopicData } from "../data/topicsData"
import FilterPanel from "../components/FilterPanel"
import type { FilterOptions } from "../types/mediaTypes"
import "../pages/TopicContentPage.css"

interface TopicContentPageProps {
  onTopicSelect: (topic: TopicData) => void
  onMovieClick?: (movieData: any) => void
  onApplyFilters: (filters: FilterOptions) => void
}

const TopicContentPage: React.FC<TopicContentPageProps> = ({ onTopicSelect, onMovieClick, onApplyFilters }) => {
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

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

  const handleTopicClick = (topic: TopicData) => {
    console.log("Selected topic:", topic)
    onTopicSelect?.(topic)
  }

  const handleFilterApply = (filters: FilterOptions) => {
    onApplyFilters(filters)
    setShowFilterPanel(false)
  }

  return (
    <div className="topics-page-container">
      <div className="topics-header">
        <h1 className="topics-title">Explore Topics</h1>
      </div>

      <div className="topics-grid">
        {topicsData.map((topic) => (
          <div
            key={topic.id}
            className={`topic-card topic-${topic.id}`}
            // style={{ background: topic.background}}
            onClick={() => handleTopicClick(topic)}
          >
            <div className="topic-card-content">
              <h3 className="topic-card-title">{topic.name}</h3>
              <p className="topic-card-description">{topic.description}</p>
              <div className="topic-card-meta">
                {topic.ageRating && (
                  <span className="topic-card-meta-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 16V12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 8H12.01"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {topic.ageRating}
                  </span>
                )}
                {topic.contentType && topic.contentType.length > 0 && (
                  <span className="topic-card-meta-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M2 12.2L10.5 20.7L22 9.2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {topic.contentType.map((type) => (type === "movie" ? "Phim" : "TV Show")).join(", ")}
                  </span>
                )}
              </div>
              <div className="topic-card-link">
                Explore
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* <button className="filter-toggle-button" onClick={() => setShowFilterPanel(!showFilterPanel)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 4H21C21.55 4 22 4.45 22 5C22 5.24 21.92 5.48 21.77 5.68L15 14V20C15 20.38 14.79 20.72 14.47 20.89L10.47 22.89C9.96 23.15 9.34 22.95 9.08 22.44C9.03 22.34 9 22.22 9 22.11V14L2.23 5.68C1.89 5.26 1.96 4.64 2.39 4.3C2.59 4.11 2.83 4 3.08 4H3Z" />
        </svg>
        Filter
      </button> */}


      <button
        className={`filter-toggle-button ${showFilterPanel ? "active" : ""}`}
        onClick={() => setShowFilterPanel(!showFilterPanel)}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={showFilterPanel ? "#1bb020ff" : "currentColor"} 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M3 4H21C21.55 4 22 4.45 22 5C22 5.24 21.92 5.48 21.77 5.68L15 14V20C15 20.38 14.79 20.72 14.47 20.89L10.47 22.89C9.96 23.15 9.34 22.95 9.08 22.44C9.03 22.34 9 22.22 9 22.11V14L2.23 5.68C1.89 5.26 1.96 4.64 2.39 4.3C2.59 4.11 2.83 4 3.08 4H3Z" />
        </svg>
        Filter
      </button>

      {showFilterPanel && <FilterPanel onApplyFilters={handleFilterApply} onClose={() => setShowFilterPanel(false)} />}

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

export default TopicContentPage