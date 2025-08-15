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
    setShowFilterPanel(false) // Close filter panel after applying
  }

  return (
    <div className="topics-page-container">
      <div className="topics-header">
        <h1 className="topics-title">Explore Topics</h1>
        <p className="topics-subtitle">Dive into curated collections of movies and TV shows.</p>
      </div>

      <div className="topics-grid">
        {topicsData.map((topic) => (
          <div
            key={topic.id}
            className="topic-card"
            style={{ backgroundImage: `url(${getImageUrl(topic.imagePath, "w500")})` }}
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
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="filter-toggle-button" onClick={() => setShowFilterPanel(!showFilterPanel)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 8L20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 12L18 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 16L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Bộ lọc
      </button>

      {showFilterPanel && <FilterPanel onApplyFilters={handleFilterApply} onClose={() => setShowFilterPanel(false)} />}

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

export default TopicContentPage





// Bản mới hơn
// "use client"

// import type React from "react"
// import { useState, useEffect } from "react"
// import { getImageUrl } from "../config/api"
// import { topicsData, type TopicData } from "../data/topicsData"
// import FilterPanel from "../components/FilterPanel"
// import type { FilterOptions } from "../types/mediaTypes"
// import "../pages/TopicContentPage.css"

// interface TopicContentPageProps {
//   onTopicSelect: (topic: TopicData) => void
//   onMovieClick?: (movieData: any) => void
//   onApplyFilters: (filters: FilterOptions) => void
// }

// const TopicContentPage: React.FC<TopicContentPageProps> = ({ onTopicSelect, onMovieClick, onApplyFilters }) => {
//   const [showFilterPanel, setShowFilterPanel] = useState(false)
//   const [showScrollTop, setShowScrollTop] = useState(false)

//   useEffect(() => {
//     const handleScroll = () => {
//       setShowScrollTop(window.scrollY > 300)
//     }

//     window.addEventListener("scroll", handleScroll)
//     return () => window.removeEventListener("scroll", handleScroll)
//   }, [])

//   const scrollToTop = () => {
//     window.scrollTo({ top: 0, behavior: "smooth" })
//   }

//   const handleTopicClick = (topic: TopicData) => {
//     console.log("Selected topic:", topic)
//     onTopicSelect?.(topic)
//   }

//   const handleFilterApply = (filters: FilterOptions) => {
//     onApplyFilters(filters)
//     setShowFilterPanel(false) // Close filter panel after applying
//   }

//   return (
//     <div className="topics-page-container">
//       <div className="topics-header">
//         <h1 className="topics-title">Explore Topics</h1>
//         <p className="topics-subtitle">Dive into curated collections of movies and TV shows.</p>
//       </div>

//       <div className="topics-grid">
//         {topicsData.map((topic) => (
//           <div
//             key={topic.id}
//             className="topic-card"
//             style={{ backgroundImage: `url(${getImageUrl(topic.imagePath, "w500")})` }}
//             onClick={() => handleTopicClick(topic)}
//           >
//             <div className="topic-card-content">
//               <h3 className="topic-card-title">{topic.name}</h3>
//               <p className="topic-card-description">{topic.description}</p>
//               <div className="topic-card-meta">
//                 {topic.ageRating && (
//                   <span className="topic-card-meta-item">
//                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                       <path
//                         d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       />
//                       <path
//                         d="M12 16V12"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       />
//                       <path
//                         d="M12 8H12.01"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       />
//                     </svg>
//                     {topic.ageRating}
//                   </span>
//                 )}
//                 {topic.contentType && topic.contentType.length > 0 && (
//                   <span className="topic-card-meta-item">
//                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                       <path
//                         d="M2 12.2L10.5 20.7L22 9.2"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       />
//                     </svg>
//                     {topic.contentType.map((type) => (type === "movie" ? "Phim" : "TV Show")).join(", ")}
//                   </span>
//                 )}
//               </div>
//               <div className="topic-card-link">
//                 Explore
//                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path
//                     d="M9 18L15 12L9 6"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   />
//                 </svg>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       <button className="filter-toggle-button" onClick={() => setShowFilterPanel(!showFilterPanel)}>
//         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//           <path d="M4 8L20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//           <path d="M6 12L18 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//           <path d="M8 16L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//         </svg>
//         B�� lọc
//       </button>

//       {showFilterPanel && <FilterPanel onApplyFilters={handleFilterApply} onClose={() => setShowFilterPanel(false)} />}

//       {showScrollTop && (
//         <button className="scroll-to-top" onClick={scrollToTop}>
//           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//             <path
//               d="M18 15L12 9L6 15"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//           </svg>
//         </button>
//       )}
//     </div>
//   )
// }

// export default TopicContentPage
