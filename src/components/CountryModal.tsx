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
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchCountries = async () => {
      if (!isOpen) return

      try {
        setLoading(true)
        setError(null)

        const response = await tmdbApi.getCountries()

        const sortedCountries = response.sort((a, b) =>
          a.english_name.localeCompare(b.english_name)
        )

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

  const handleCountryClick = (country: Country) => {
    console.log("Selected country:", country)
    onCountrySelect?.(country)
    onClose()
  }

  const filteredCountries = countries.filter((country) =>
    country.english_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <div className="country-dropdown">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search country..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input-country"
        />
      </div>

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

      {!loading && !error && filteredCountries.length > 0 && (
        <div className="country-grid">
          {filteredCountries.map((country) => (
            <button
              key={country.iso_3166_1}
              className="country-item"
              onClick={() => handleCountryClick(country)}
            >
              {country.english_name}
            </button>
          ))}
        </div>

      )}

      {!loading && !error && filteredCountries.length === 0 && (
        <p style={{ padding: "1rem" }}>No countries found.</p>
      )}
    </div>
  )
}

export default CountryModal
