// "use client"

// import type React from "react"
// import { useState, useEffect } from "react"
// import { tmdbApi } from "../services/tmdbApi"
// import { getImageUrl } from "../config/api"
// import type { TVShow } from "../types/mediaTypes"
// import "./SeriesPage.css"

// interface SeriesPageProps {
//   onBack: () => void
//   onMovieClick?: (movieData: any) => void
// }

// const SeriesPage: React.FC<SeriesPageProps> = ({ onBack, onMovieClick }) => {
//   const [series, setSeries] = useState<TVShow[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [activeCategory, setActiveCategory] = useState<"popular" | "top_rated" | "on_the_air" | "airing_today">(
//     "popular",
//   )
//   const [page, setPage] = useState(1)
//   const [totalPages, setTotalPages] = useState(1)
//   const [showScrollTop, setShowScrollTop] = useState(false)

//   const categories = [
//     { key: "popular", label: "Popular", description: "Most popular TV shows right now" },
//     { key: "top_rated", label: "Top Rated", description: "Highest rated TV shows of all time" },
//     { key: "on_the_air", label: "On The Air", description: "Currently airing TV shows" },
//     { key: "airing_today", label: "Airing Today", description: "TV shows airing today" },
//   ] as const

//   useEffect(() => {
//     const fetchSeries = async () => {
//       try {
//         setLoading(true)
//         setError(null)

//         let response: TVShow[] = []

//         switch (activeCategory) {
//           case "popular":
//             response = await tmdbApi.getPopularTVShows(page)
//             break
//           case "top_rated":
//             response = await tmdbApi.getTopRatedTVShows(page)
//             break
//           case "on_the_air":
//             response = await tmdbApi.getOnTheAirTVShows(page)
//             break
//           case "airing_today":
//             response = await tmdbApi.getAiringTodayTVShows(page)
//             break
//         }

//         if (page === 1) {
//           setSeries(response)
//         } else {
//           setSeries((prev) => [...prev, ...response])
//         }

//         // Estimate total pages
//         setTotalPages(Math.min(20, Math.ceil(response.length > 0 ? 500 / 20 : 1)))
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "Failed to fetch TV shows")
//         console.error("Error fetching TV shows:", err)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchSeries()
//   }, [activeCategory, page])

//   useEffect(() => {
//     // Reset page when switching categories
//     setPage(1)
//   }, [activeCategory])

//   useEffect(() => {
//     const handleScroll = () => {
//       setShowScrollTop(window.scrollY > 300)
//     }

//     window.addEventListener("scroll", handleScroll)
//     return () => window.removeEventListener("scroll", handleScroll)
//   }, [])

//   const loadMore = () => {
//     if (page < totalPages && !loading) {
//       setPage((prev) => prev + 1)
//     }
//   }

//   const handleSeriesClick = (show: TVShow) => {
//     if (onMovieClick) {
//       const mediaItem = {
//         ...show,
//         media_type: "tv" as const,
//         title: show.name,
//         release_date: show.first_air_date,
//       }
//       onMovieClick(mediaItem)
//     }
//   }

//   const scrollToTop = () => {
//     window.scrollTo({ top: 0, behavior: "smooth" })
//   }

//   const currentCategory = categories.find((cat) => cat.key === activeCategory)

//   if (loading && page === 1) {
//     return (
//       <div className="series-page-container">
//         <div className="loading-state">
//           <div className="loading-spinner"></div>
//           <p>Loading TV shows...</p>
//         </div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="series-page-container">
//         <div className="error-state">
//           <p>Error: {error}</p>
//           <button onClick={() => window.location.reload()}>Retry</button>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="series-page-container">
//       <div className="series-header">
//         <h1 className="series-title">TV Series</h1>
//         <p className="series-subtitle">Discover amazing TV shows and series from around the world</p>
//       </div>

//       <div className="category-tabs">
//         {categories.map((category) => (
//           <button
//             key={category.key}
//             className={`category-tab ${activeCategory === category.key ? "active" : ""}`}
//             onClick={() => setActiveCategory(category.key)}
//           >
//             <span className="category-label">{category.label}</span>
//             <span className="category-description">{category.description}</span>
//           </button>
//         ))}
//       </div>

//       <div className="current-category-info">
//         <h2 className="category-title">{currentCategory?.label}</h2>
//         <p className="category-subtitle">{currentCategory?.description}</p>
//         <span className="series-count">({series.length} TV shows)</span>
//       </div>

//       <div className="series-grid">
//         {series.map((show) => (
//           <div key={show.id} className="series-card" onClick={() => handleSeriesClick(show)}>
//             <div className="series-poster">
//               <img
//                 src={getImageUrl(show.poster_path, "w500") || "/placeholder.svg?height=300&width=200"}
//                 alt={show.name}
//                 onError={(e) => {
//                   e.currentTarget.src = "/placeholder.svg?height=300&width=200"
//                 }}
//               />
//               <div className="series-overlay">
//                 <button className="play-btn">▶</button>
//               </div>
//             </div>
//             <div className="series-info">
//               <h3 className="series-title">{show.name}</h3>
//               <div className="series-meta">
//                 <span className="series-year">{new Date(show.first_air_date).getFullYear()}</span>
//                 <span className="series-rating">⭐ {show.vote_average.toFixed(1)}</span>
//               </div>
//               <p className="series-overview">
//                 {show.overview ? show.overview.substring(0, 100) + "..." : "No description available"}
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {series.length > 0 && page < totalPages && (
//         <div className="load-more-container">
//           <button className="load-more-btn" onClick={loadMore} disabled={loading}>
//             {loading ? (
//               <>
//                 <div className="loading-spinner small"></div>
//                 Loading...
//               </>
//             ) : (
//               "Load More TV Shows"
//             )}
//           </button>
//         </div>
//       )}

//       {series.length === 0 && !loading && (
//         <div className="no-series">
//           <p>No TV shows found in this category.</p>
//         </div>
//       )}

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

// export default SeriesPage



"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { tmdbApi } from "../services/tmdbApi"
import { getImageUrl } from "../config/api"
import type { TVShow } from "../types/mediaTypes"
import MovieCard from "../components/MovieCard"
import LoadingSpinner from "../components/LoadingSpinner"
import "../pages/SeriesPage.css"

interface SeriesPageProps {
  onBack: () => void
  onMovieClick: (movieData: any) => void
}

const SeriesPage: React.FC<SeriesPageProps> = ({ onBack, onMovieClick }) => {
  const [tvShows, setTvShows] = useState<TVShow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<"popular" | "top_rated" | "on_the_air" | "airing_today">(
    "popular",
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const categories = [
    { key: "popular", label: "Popular", description: "Most popular TV shows right now" },
    { key: "top_rated", label: "Top Rated", description: "Highest rated TV shows of all time" },
    { key: "on_the_air", label: "On The Air", description: "Currently airing shows" },
    { key: "airing_today", label: "Airing Today", description: "Shows airing today" },
  ] as const

  const fetchTVShowsByCategory = async (category: string, pageNum: number) => {
    switch (category) {
      case "popular":
        return await tmdbApi.getPopularTVShows(pageNum)
      case "top_rated":
        return await tmdbApi.getTopRatedTVShows(pageNum)
      case "on_the_air":
        return await tmdbApi.getOnTheAirTVShows(pageNum)
      case "airing_today":
        return await tmdbApi.getAiringTodayTVShows(pageNum)
      default:
        return []
    }
  }

  const loadInitialTVShows = async () => {
    try {
      setLoading(true)
      setTvShows([])
      setCurrentPage(1)
      setHasMore(true)

      const page1Data = await fetchTVShowsByCategory(activeCategory, 1)
      const page2Data = await fetchTVShowsByCategory(activeCategory, 2)

      const allTVShows = [...page1Data, ...page2Data]

      // Remove duplicates
      const uniqueTVShows = allTVShows.filter((tv, idx, self) => idx === self.findIndex((x) => x.id === tv.id))

      // Get first 24 TV shows
      const first24 = uniqueTVShows.slice(0, 24)

      setTvShows(first24)
      setCurrentPage(2) // Already fetched up to page 2
      setHasMore(uniqueTVShows.length >= 24 && page2Data.length > 0)
    } catch (err) {
      setError("Failed to load TV shows")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInitialTVShows()
  }, [activeCategory])

  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    try {
      setLoadingMore(true)

      let newTVShows: TVShow[] = []
      let nextPage = currentPage + 1

      while (newTVShows.length < 24 && nextPage <= 50) {
        const pageData = await fetchTVShowsByCategory(activeCategory, nextPage)
        if (pageData.length === 0) {
          setHasMore(false)
          break
        }

        const existingIds = new Set([...tvShows, ...newTVShows].map((tv) => tv.id))
        const uniquePageTVShows = pageData.filter((tv) => !existingIds.has(tv.id))

        newTVShows = [...newTVShows, ...uniquePageTVShows]
        nextPage++
      }

      const tvShowsToAdd = newTVShows.slice(0, 24)

      if (tvShowsToAdd.length > 0) {
        setTvShows((prev) => [...prev, ...tvShowsToAdd])
        setCurrentPage(nextPage - 1)
      }

      if (tvShowsToAdd.length < 24) setHasMore(false)
    } catch (err) {
      console.error("Failed to load more TV shows:", err)
    } finally {
      setLoadingMore(false)
    }
  }

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

  const convertToMovieCardFormat = (tvShow: TVShow) => {
    return {
      id: tvShow.id,
      title: tvShow.name, // Use 'name' for TV shows
      poster: getImageUrl(tvShow.poster_path, "w500"),
      year: new Date(tvShow.first_air_date).getFullYear(),
      rating: tvShow.vote_average,
      genres: [], // Genres will be fetched on MovieDetailsPage
      media_type: "tv" as const, // Explicitly set media_type to 'tv'
      backdrop_path: tvShow.backdrop_path,
    }
  }

  if (loading) {
    return (
      <div className="category-page">
        <div className="category-header">
          <button className="back-button" onClick={onBack}>
            ← Back
          </button>
          <h1 className="category-title">TV Series</h1>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="category-page">
        <div className="category-header">
          <button className="back-button" onClick={onBack}>
            ← Back
          </button>
          <h1 className="category-title">TV Series</h1>
        </div>
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button className="retry-button" onClick={loadInitialTVShows}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="category-page">
      <div className="category-header">
        {/* <button className="back-button" onClick={onBack}>
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
        </button> */}
        <h1 className="category-title">TV Series</h1>
      </div>

      <div className="category-tabs-series">
        {categories.map((category) => (
          <button
            key={category.key}
            className={`category-tab-series ${activeCategory === category.key ? "active" : ""}`}
            onClick={() => setActiveCategory(category.key)}
          >
            <span className="category-label">{category.label}</span>
            <span className="category-description">{category.description}</span>
          </button>
        ))}
      </div>

      <div className="category-content">
        <div className="movies-grid">
          {tvShows.map((tvShow) => (
            <MovieCard key={tvShow.id} movie={convertToMovieCardFormat(tvShow)} onMovieClick={onMovieClick} />
          ))}
        </div>

        {hasMore && (
          <div className="load-more-container">
            <button className="load-more-button" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? (
                <div className="loading-spinner-small"></div>
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
      </div>

      {showScrollTop && (
        <button className="scroll-to-top" onClick={scrollToTop}>
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="12" y1="20" x2="12" y2="6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <polyline
              points="6 12 12 6 18 12"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line x1="6" y1="2" x2="18" y2="2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default SeriesPage
