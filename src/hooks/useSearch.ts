"use client"

import { useState, useEffect, useCallback } from "react"
import { tmdbApi } from "../services/tmdbApi"
import type { MediaItem } from "../types/mediaTypes"

export function useSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const searchResults = await tmdbApi.searchMulti(searchQuery)
      setResults(searchResults.slice(0, 10))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed")
      console.error("Search error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      search(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, search])

  const clearSearch = useCallback(() => {
    setQuery("")
    setResults([])
    setError(null)
  }, [])

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    search,
    clearSearch,
  }
}
