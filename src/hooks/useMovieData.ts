"use client"

import { useState, useEffect } from "react"
import { tmdbApi } from "../services/tmdbApi"
import type { Movie, TVShow, MediaItem } from "../types/mediaTypes"

export interface MovieData {
  trending: MediaItem[]
  popularMovies: MediaItem[] 
  popularTVShows: MediaItem[] 
  nowPlaying: MediaItem[] 
  upcoming: MediaItem[] 
  topRatedMovies: MediaItem[] 
  topRatedTVShows: MediaItem[] 
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

        const moviesAsMediaItems = (movies: Movie[]): MediaItem[] =>
          movies.map((movie) => ({ ...movie, media_type: "movie" }))
        const tvShowsAsMediaItems = (tvShows: TVShow[]): MediaItem[] =>
          tvShows.map((tv) => ({ ...tv, media_type: "tv" }))

        setMovieData({
          trending: trendingData.slice(0, 20), 
          popularMovies: moviesAsMediaItems(popularMoviesData).slice(0, 20),
          popularTVShows: tvShowsAsMediaItems(popularTVShowsData).slice(0, 20),
          nowPlaying: moviesAsMediaItems(nowPlayingData).slice(0, 20),
          upcoming: moviesAsMediaItems(upcomingData).slice(0, 20),
          topRatedMovies: moviesAsMediaItems(topRatedMoviesData).slice(0, 20),
          topRatedTVShows: tvShowsAsMediaItems(topRatedTVShowsData).slice(0, 20),
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
