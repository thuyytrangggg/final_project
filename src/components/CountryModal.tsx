"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { tmdbApi } from "../services/tmdbApi"
import "../styles/CountryModal.css"

interface Country {
  iso_3166_1: string
  english_name: string
  native_name?: string
}

interface CountryModalProps {
  isOpen: boolean
  onClose: () => void
  onCountrySelect?: (country: Country) => void
}

const CountryModal: React.FC<CountryModalProps> = ({ isOpen, onClose, onCountrySelect }) => {
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCountries = async () => {
      if (!isOpen) return

      try {
        setLoading(true)
        setError(null)

        const response = await tmdbApi.getCountries()

        const popularCountries = [
          "US",
          "GB",
          "CA",
          "KR",
          "HK",
          "JP",
          "FR",
          "TH",
          "CN",
          "AU",
          "TW",
          "DE",
          "IN",
          "IT",
          "ES",
          "RU",
          "BR",
          "MX",
          "VN",
        ]

        const sortedCountries = response.sort((a, b) => {
          const aIndex = popularCountries.indexOf(a.iso_3166_1)
          const bIndex = popularCountries.indexOf(b.iso_3166_1)

          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex
          }

          if (aIndex !== -1) return -1
          if (bIndex !== -1) return 1

          return a.english_name.localeCompare(b.english_name)
        })

        setCountries(sortedCountries)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch countries")
        console.error("Error fetching countries:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCountries()
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element
      if (!target.closest(".country-dropdown")) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleCountryClick = (country: Country) => {
    console.log("Selected country:", country)
    onCountrySelect?.(country)
    onClose()
  }

  const getCountryColumns = () => {
    const itemsPerColumn = Math.ceil(countries.length / 3)
    const columns: Country[][] = [[], [], []]

    countries.forEach((country, index) => {
      const columnIndex = Math.floor(index / itemsPerColumn)
      if (columnIndex < 3) {
        columns[columnIndex].push(country)
      }
    })

    return columns
  }

  return (
    <div className="country-dropdown">
      {loading && (
        <div className="country-loading">
          <div className="loading-spinner"></div>
          <p>Loading countries...</p>
        </div>
      )}

      {error && (
        <div className="country-error">
          <p>Error loading countries</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {!loading && !error && countries.length > 0 && (
        <div className="country-grid">
          {getCountryColumns().map((column, columnIndex) => (
            <div key={columnIndex} className="country-column">
              {column.map((country) => (
                <button key={country.iso_3166_1} className="country-item" onClick={() => handleCountryClick(country)}>
                  {country.english_name}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CountryModal
