"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { tmdbApi } from "../services/tmdbApi"
import { getImageUrl } from "../config/api"
import type { FilterOptions, MediaItem } from "../types/mediaTypes"
import MovieSection from "../components/MovieSection"
import LoadingSpinner from "../components/LoadingSpinner"
import "../pages/FilteredResultsPage.css"

interface FilteredResultsPageProps {
  filters: FilterOptions
  onBack: () => void
  onMovieClick: (movieData: any) => void
  genres: { [key: number]: string } 
}

const FilteredResultsPage: React.FC<FilteredResultsPageProps> = ({ filters, onBack, onMovieClick, genres }) => {
  const [filteredMovies, setFilteredMovies] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    setFilteredMovies([]) 
    setPage(1)
    setHasMore(true) 
    fetchFilteredMedia(1) 
  }, [filters]) 

  const fetchFilteredMedia = async (currentPage: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await tmdbApi.discoverMedia(filters, currentPage)
      if (currentPage === 1) {
        setFilteredMovies(data)
      } else {
        setFilteredMovies((prev) => [...prev, ...data])
      }
      setHasMore(data.length > 0) 
    } catch (err) {
      console.error("Error fetching filtered media:", err)
      setError("Không thể tải kết quả lọc. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prevPage) => prevPage + 1)
      fetchFilteredMedia(page + 1)
    }
  }

  const convertToMovieFormat = (items: MediaItem[]) => {
    return items.map((item) => ({
      id: item.id,
      title: item.media_type === "movie" ? item.title || "Unknown Title" : item.name || "Unknown Title",
      poster: getImageUrl(item.poster_path, "w500") || "/placeholder.svg?height=300&width=200",
      year: item.release_date
        ? new Date(item.release_date).getFullYear()
        : item.first_air_date
          ? new Date(item.first_air_date).getFullYear()
          : 2023,
      rating: item.vote_average || 0,
      genres:
        item.genre_ids
          ?.slice(0, 2)
          .map((id: number) => genres[id])
          .filter(Boolean) || [],
      media_type: item.media_type,
      backdrop_path: item.backdrop_path,
    }))
  }

  if (loading && filteredMovies.length === 0) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="filtered-results-container">
        <div className="error-state">
          <p>Lỗi: {error}</p>
          <button onClick={() => fetchFilteredMedia(1)}>Thử lại</button>
        </div>
      </div>
    )
  }

  const displayTitle = "Kết quả lọc"

  return (
    <div className="filtered-results-container">
      <div className="filtered-results-header">
        <button onClick={onBack} className="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Quay lại
        </button>
        <h1 className="filtered-results-title">{displayTitle}</h1>
      </div>

      {filteredMovies.length === 0 && !loading ? (
        <div className="no-results">
          <p>Không tìm thấy kết quả nào phù hợp với bộ lọc của bạn.</p>
          <button onClick={onBack} className="back-to-filter-button">
            Thay đổi bộ lọc
          </button>
        </div>
      ) : (
        <>
          <MovieSection
            title="" 
            movies={convertToMovieFormat(filteredMovies)}
            onMovieClick={onMovieClick}
          />
          {hasMore && (
            <div className="load-more-container">
              <button onClick={handleLoadMore} className="load-more-button" disabled={loading}>
                {loading ? "Đang tải..." : "Tải thêm"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default FilteredResultsPage
