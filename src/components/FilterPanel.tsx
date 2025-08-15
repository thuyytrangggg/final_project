"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { tmdbApi } from "../services/tmdbApi"
import type { Genre, Country, FilterOptions } from "../types/mediaTypes"
import "../styles/FilterPanel.css"

interface FilterPanelProps {
  onApplyFilters: (filters: FilterOptions) => void
  onClose: () => void
}

const currentYear = new Date().getFullYear()
const productionYears = Array.from({ length: currentYear - 2009 }, (_, i) => currentYear - i) 

const FilterPanel: React.FC<FilterPanelProps> = ({ onApplyFilters, onClose }) => {
  const [availableGenres, setAvailableGenres] = useState<Genre[]>([])
  const [availableCountries, setAvailableCountries] = useState<Country[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [errorData, setErrorData] = useState<string | null>(null)

  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedContentTypes, setSelectedContentTypes] = useState<("movie" | "tv")[]>([])
  const [selectedAgeRatings, setSelectedAgeRatings] = useState<string[]>([])
  const [selectedGenres, setSelectedGenres] = useState<number[]>([])
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]) 
  const [selectedProductionYears, setSelectedProductionYears] = useState<number[]>([])
  const [customProductionYear, setCustomProductionYear] = useState<string>("")
  const [selectedSortBy, setSelectedSortBy] = useState<string>("popularity.desc")

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        setLoadingData(true)
        const movieGenres = await tmdbApi.getMovieGenres()
        const tvGenres = await tmdbApi.getTVGenres()
        const countries = await tmdbApi.getCountries()

        const combinedGenresMap = new Map<number, Genre>()
        movieGenres.forEach((genre) => combinedGenresMap.set(genre.id, genre))
        tvGenres.forEach((genre) => combinedGenresMap.set(genre.id, genre))
        const sortedGenres = Array.from(combinedGenresMap.values()).sort((a, b) => a.name.localeCompare(b.name))
        setAvailableGenres(sortedGenres)

        const filteredCountries = countries
          .filter((country) => country.english_name && country.english_name.length > 1)
          .sort((a, b) => a.english_name.localeCompare(b.english_name))
        setAvailableCountries(filteredCountries)
      } catch (err) {
        console.error("Error fetching filter data:", err)
        setErrorData("Failed to load filter options.")
      } finally {
        setLoadingData(false)
      }
    }
    fetchFilterData()
  }, [])

  const handleToggleSelection = <T,>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    currentSelection: T[],
    item: T,
    allOption: T,
  ) => {
    if (item === allOption) {
      setter([]) 
    } else {
      setter((prev) => {
        const newSelection = prev.filter((val) => val !== allOption) 
        if (newSelection.includes(item)) {
          return newSelection.filter((val) => val !== item)
        } else {
          return [...newSelection, item]
        }
      })
    }
  }

  const handleSingleSelection = <T,>(setter: React.Dispatch<React.SetStateAction<T>>, item: T) => {
    setter(item)
  }

  const handleApply = () => {
    const filters: FilterOptions = {
      countries: selectedCountries,
      contentTypes: selectedContentTypes,
      ageRatings: selectedAgeRatings,
      genres: selectedGenres,
      versions: selectedVersions,
      productionYears:
        selectedProductionYears.length > 0
          ? selectedProductionYears
          : customProductionYear
            ? [Number.parseInt(customProductionYear)]
            : [],
      sortBy: selectedSortBy,
      queryYear: customProductionYear,
    }
    onApplyFilters(filters)
  }

  const handleClearFilters = () => {
    setSelectedCountries([])
    setSelectedContentTypes([])
    setSelectedAgeRatings([])
    setSelectedGenres([])
    setSelectedVersions([])
    setSelectedProductionYears([])
    setCustomProductionYear("")
    setSelectedSortBy("popularity.desc")
  }

  const renderFilterSection = (
    title: string,
    options: { value: any; label: string }[],
    currentSelection: any[],
    setter: React.Dispatch<React.SetStateAction<any[]>>,
    allOptionValue: any,
    isMultiSelect = true,
    customInput?: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string },
  ) => (
    <div className="filter-section">
      <h3 className="filter-section-title">{title}</h3>
      <div className="filter-options">
        <button
          className={`filter-option-button ${currentSelection.length === 0 ? "selected" : ""}`}
          onClick={() => setter([])}
        >
          Tất cả
        </button>
        {options.map((option) => (
          <button
            key={option.value}
            className={`filter-option-button ${currentSelection.includes(option.value) ? "selected" : ""}`}
            onClick={() =>
              isMultiSelect
                ? handleToggleSelection(setter, currentSelection, option.value, allOptionValue)
                : handleSingleSelection(setter as React.Dispatch<React.SetStateAction<any>>, option.value)
            }
          >
            {option.label}
          </button>
        ))}
        {customInput && (
          <div className="custom-year-input-container">
            <input
              type="number"
              value={customInput.value}
              onChange={customInput.onChange}
              placeholder={customInput.placeholder}
              className="custom-year-input"
            />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 21L16.65 16.65"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  )

  if (loadingData) {
    return (
      <div className="filter-panel-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading filter options...</p>
        </div>
      </div>
    )
  }

  if (errorData) {
    return (
      <div className="filter-panel-container">
        <div className="error-state">
          <p>Error: {errorData}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="filter-panel-container">
      <div className="filter-panel-header">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 8L20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 12L18 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 16L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2>Bộ lọc</h2>
      </div>

      {renderFilterSection(
        "Quốc gia:",
        availableCountries.map((c) => ({ value: c.iso_3166_1, label: c.english_name })),
        selectedCountries,
        setSelectedCountries,
        [],
      )}

      {renderFilterSection(
        "Loại phim:",
        [
          { value: "movie", label: "Phim lẻ" },
          { value: "tv", label: "Phim bộ" },
        ],
        selectedContentTypes,
        setSelectedContentTypes,
        [],
      )}

      {renderFilterSection(
        "Xếp hạng:",
        [
          { value: "P", label: "P (Mọi lứa tuổi)" },
          { value: "K", label: "K (Dưới 13 tuổi)" },
          { value: "T13", label: "T13 (13 tuổi trở lên)" },
          { value: "T16", label: "T16 (16 tuổi trở lên)" },
          { value: "T18", label: "T18 (18 tuổi trở lên)" },
        ],
        selectedAgeRatings,
        setSelectedAgeRatings,
        [], 
      )}

      {renderFilterSection(
        "Thể loại:",
        availableGenres.map((g) => ({ value: g.id, label: g.name })),
        selectedGenres,
        setSelectedGenres,
        [], 
      )}

      {renderFilterSection(
        "Phiên bản:",
        [
          { value: "Phụ đề", label: "Phụ đề" },
          { value: "Lồng tiếng", label: "Lồng tiếng" },
        ],
        selectedVersions,
        setSelectedVersions,
        [],
      )}

      {renderFilterSection(
        "Năm sản xuất:",
        productionYears.map((year) => ({ value: year, label: year.toString() })),
        selectedProductionYears,
        setSelectedProductionYears,
        [],
        true,
        {
          value: customProductionYear,
          onChange: (e) => setCustomProductionYear(e.target.value),
          placeholder: "Nhập năm",
        },
      )}

      <div className="filter-section">
        <h3 className="filter-section-title">Sắp xếp:</h3>
        <div className="filter-options">
          <button
            className={`filter-option-button ${selectedSortBy === "popularity.desc" ? "selected" : ""}`}
            onClick={() => setSelectedSortBy("popularity.desc")}
          >
            Mới nhất
          </button>
          <button
            className={`filter-option-button ${selectedSortBy === "primary_release_date.desc" ? "selected" : ""}`}
            onClick={() => setSelectedSortBy("primary_release_date.desc")}
          >
            Mới cập nhật
          </button>
          <button
            className={`filter-option-button ${selectedSortBy === "vote_average.desc" ? "selected" : ""}`}
            onClick={() => setSelectedSortBy("vote_average.desc")}
          >
            Điểm IMDb
          </button>
          <button
            className={`filter-option-button ${selectedSortBy === "vote_count.desc" ? "selected" : ""}`}
            onClick={() => setSelectedSortBy("vote_count.desc")}
          >
            Lượt xem
          </button>
        </div>
      </div>

      <div className="filter-actions">
        <button className="apply-filters-button" onClick={handleApply}>
          Lọc kết quả
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path
              d="M12 5L19 12L12 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button className="close-filters-button" onClick={onClose}>
          Đóng
        </button>
        <button className="clear-filters-button" onClick={handleClearFilters}>
          Xóa bộ lọc
        </button>
      </div>
    </div>
  )
}

export default FilterPanel
