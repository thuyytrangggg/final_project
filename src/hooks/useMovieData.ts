export const topicsData = [
  { name: "Marvel", background: "linear-gradient(135deg, #6A5ACD, #483D8B)" },
  { name: "Slay", background: "linear-gradient(135deg, #9932CC, #8A2BE2)" }, 
  { name: "Sitcom", background: "linear-gradient(135deg, #20B2AA, #008B8B)" }, 
  { name: "4K", background: "linear-gradient(135deg, #8470FF, #6A5ACD)" }, 
  // { name: "Lồng Tiếng Cực Mạnh", background: "linear-gradient(135deg, #9370DB, #8A2BE2)" },
  // { name: "Đỉnh Nóc", background: "linear-gradient(135deg, #00CED1, #20B2AA)" }, 
  // { name: "Xuyên Không", background: "linear-gradient(135deg, #FF8C00, #FF4500)" }, 
  // { name: "9x", background: "linear-gradient(135deg, #6B8E23, #556B2F)" }, 
  // { name: "Cổ Trang", background: "linear-gradient(135deg, #CD5C5C, #B22222)" }, 
  // { name: "Tham Vọng", background: "linear-gradient(135deg, #C71585, #8B008B)" }, 
  // { name: "Chữa Lành", background: "linear-gradient(135deg, #FFB6C1, #FF69B4)" }, 
  // { name: "Phù Thủy", background: "linear-gradient(135deg, #DA70D6, #BA55D3)" }, 
]
"use client"

import { useState, useEffect } from "react"
import { tmdbApi } from "../services/tmdbApi"
import type { Movie, TVShow, MediaItem } from "../types/mediaTypes"

export interface MovieData {
  trending: MediaItem[]
  popularMovies: Movie[]
  popularTVShows: TVShow[]
  nowPlaying: Movie[]
  upcoming: Movie[]
  topRatedMovies: Movie[]
  topRatedTVShows: TVShow[]
}

export function useMovieData() {
  const [movieData, setMovieData] = useState<MovieData>({
    trending: [],
    popularMovies: [],
    popularTVShows: [],
    nowPlaying: [],
    upcoming: [],
    topRatedMovies: [],
    topRatedTVShows: [],
  })
  const [genres, setGenres] = useState<{ [key: number]: string }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [
          trendingData,
          popularMoviesData,
          popularTVShowsData,
          nowPlayingData,
          upcomingData,
          topRatedMoviesData,
          topRatedTVShowsData,
          movieGenres,
          tvGenres,
        ] = await Promise.all([
          tmdbApi.getTrending("all", "week"),
          tmdbApi.getPopularMovies(),
          tmdbApi.getPopularTVShows(),
          tmdbApi.getNowPlayingMovies(),
          tmdbApi.getUpcomingMovies(),
          tmdbApi.getTopRatedMovies(),
          tmdbApi.getTopRatedTVShows(),
          tmdbApi.getMovieGenres(),
          tmdbApi.getTVGenres(),
        ])

        const allGenres = [...movieGenres, ...tvGenres]
        const genreMap = allGenres.reduce(
          (acc, genre) => {
            acc[genre.id] = genre.name
            return acc
          },
          {} as { [key: number]: string },
        )

        setMovieData({
          trending: trendingData.slice(0, 20),
          popularMovies: popularMoviesData.slice(0, 20),
          popularTVShows: popularTVShowsData.slice(0, 20),
          nowPlaying: nowPlayingData.slice(0, 20),
          upcoming: upcomingData.slice(0, 20),
          topRatedMovies: topRatedMoviesData.slice(0, 20),
          topRatedTVShows: topRatedTVShowsData.slice(0, 20),
        })

        setGenres(genreMap)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        console.error("Error fetching movie data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { movieData, genres, loading, error }
}
