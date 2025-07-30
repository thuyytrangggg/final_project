"use client"

import type React from "react"
import { useState, useEffect } from "react"
import "../styles/CountryModal.css"

interface Country {
  iso_3166_1: string
  english_name: string
  native_name: string
}

interface CountryModalProps {
  isOpen: boolean
  onClose: () => void
  onCountrySelect?: (country: Country) => void
}

const CountryModal: React.FC<CountryModalProps> = ({ isOpen, onClose, onCountrySelect }) => {
  const [countries] = useState<Country[]>([
    { iso_3166_1: "GB", english_name: "United Kingdom", native_name: "Anh" },
    { iso_3166_1: "CA", english_name: "Canada", native_name: "Canada" },
    { iso_3166_1: "KR", english_name: "South Korea", native_name: "Hàn Quốc" },
    { iso_3166_1: "HK", english_name: "Hong Kong", native_name: "Hồng Kông" },
    { iso_3166_1: "US", english_name: "United States", native_name: "Mỹ" },
    { iso_3166_1: "JP", english_name: "Japan", native_name: "Nhật Bản" },
    { iso_3166_1: "FR", english_name: "France", native_name: "Pháp" },
    { iso_3166_1: "TH", english_name: "Thailand", native_name: "Thái Lan" },
    { iso_3166_1: "CN", english_name: "China", native_name: "Trung Quốc" },
    { iso_3166_1: "AU", english_name: "Australia", native_name: "Úc" },
    { iso_3166_1: "TW", english_name: "Taiwan", native_name: "Đài Loan" },
    { iso_3166_1: "DE", english_name: "Germany", native_name: "Đức" },
    { iso_3166_1: "IN", english_name: "India", native_name: "Ấn Độ" },
    { iso_3166_1: "IT", english_name: "Italy", native_name: "Ý" },
    { iso_3166_1: "ES", english_name: "Spain", native_name: "Tây Ban Nha" },
    { iso_3166_1: "RU", english_name: "Russia", native_name: "Nga" },
    { iso_3166_1: "BR", english_name: "Brazil", native_name: "Brazil" },
    { iso_3166_1: "MX", english_name: "Mexico", native_name: "Mexico" },
  ])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element
      if (!target.closest(".country-dropdown") && !target.closest(".nav-link")) {
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
      <div className="country-grid">
        {getCountryColumns().map((column, columnIndex) => (
          <div key={columnIndex} className="country-column">
            {column.map((country) => (
              <button key={country.iso_3166_1} className="country-item" onClick={() => handleCountryClick(country)}>
                {country.native_name}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CountryModal
