import { API_CONFIG } from "../config/api"
import type {
  Movie,
  TVShow,
  MediaItem,
  MovieDetails,
  Genre,
  Cast,
  Video,
  TMDBResponse,
  Actor,
  ActorDetails,
  FilterOptions,
  Country,
} from "../types/mediaTypes"

class TMDBApi {
  private async fetchFromTMDB<T>(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<T> {
    const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`)
    url.searchParams.append("api_key", API_CONFIG.API_KEY)

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    try {
      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error("TMDB API Error:", error)
      throw error
    }
  }

  async getTrending(
    mediaType: "all" | "movie" | "tv" = "all",
    timeWindow: "day" | "week" = "week"
  ): Promise<MediaItem[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<MediaItem>>(
      `/trending/${mediaType}/${timeWindow}`
    )
    return response.results
  }

  async getPopularMovies(page = 1): Promise<Movie[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<Movie>>("/movie/popular", {
      page: page.toString(),
    })
    return response.results
  }

  async getPopularTVShows(page = 1): Promise<TVShow[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<TVShow>>("/tv/popular", {
      page: page.toString(),
    })
    return response.results
  }

  async getNowPlayingMovies(page = 1): Promise<Movie[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<Movie>>("/movie/now_playing", {
      page: page.toString(),
    })
    return response.results
  }

  async getUpcomingMovies(page = 1): Promise<Movie[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<Movie>>("/movie/upcoming", {
      page: page.toString(),
    })
    return response.results
  }

  async getTopRatedMovies(page = 1): Promise<Movie[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<Movie>>("/movie/top_rated", {
      page: page.toString(),
    })
    return response.results
  }

  async getTopRatedTVShows(page = 1): Promise<TVShow[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<TVShow>>("/tv/top_rated", {
      page: page.toString(),
    })
    return response.results
  }

  async getMovieDetails(
    movieId: number
  ): Promise<MovieDetails & { credits?: { cast: Cast[] }; videos?: { results: Video[] } }> {
    return await this.fetchFromTMDB<
      MovieDetails & { credits?: { cast: Cast[] }; videos?: { results: Video[] } }
    >(`/movie/${movieId}`, {
      append_to_response: "credits,videos,similar,recommendations",
    })
  }

  async getTVShowDetails(
    tvId: number
  ): Promise<TVShow & { credits?: { cast: Cast[] }; videos?: { results: Video[] } }> {
    return await this.fetchFromTMDB<
      TVShow & { credits?: { cast: Cast[] }; videos?: { results: Video[] } }
    >(`/tv/${tvId}`, {
      append_to_response: "credits,videos,similar,recommendations",
    })
  }

  async getMovieCredits(movieId: number): Promise<{ cast: Cast[]; crew: any[] }> {
    return await this.fetchFromTMDB<{ cast: Cast[]; crew: any[] }>(`/movie/${movieId}/credits`)
  }

  async getMovieVideos(movieId: number): Promise<{ results: Video[] }> {
    return await this.fetchFromTMDB<{ results: Video[] }>(`/movie/${movieId}/videos`)
  }

  async getMovieGenres(): Promise<Genre[]> {
    const response = await this.fetchFromTMDB<{ genres: Genre[] }>("/genre/movie/list")
    return response.genres
  }

  async getTVGenres(): Promise<Genre[]> {
    const response = await this.fetchFromTMDB<{ genres: Genre[] }>("/genre/tv/list")
    return response.genres
  }

  async getCountries(): Promise<Country[]> {
    const response = await this.fetchFromTMDB<Country[]>("/configuration/countries")
    return response
  }

  async searchMovies(query: string, page = 1): Promise<Movie[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<Movie>>("/search/movie", {
      query: encodeURIComponent(query),
      page: page.toString(),
    })
    return response.results
  }

  async searchTVShows(query: string, page = 1): Promise<TVShow[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<TVShow>>("/search/tv", {
      query: encodeURIComponent(query),
      page: page.toString(),
    })
    return response.results
  }

  async searchMulti(query: string, page = 1): Promise<MediaItem[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<MediaItem>>("/search/multi", {
      query: encodeURIComponent(query),
      page: page.toString(),
    })
    return response.results.filter(
      (item) => item.media_type === "movie" || item.media_type === "tv"
    )
  }

  async discoverMoviesByGenre(genreId: number, page = 1): Promise<Movie[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<Movie>>("/discover/movie", {
      with_genres: genreId.toString(),
      page: page.toString(),
      sort_by: "popularity.desc",
    })
    return response.results
  }

  async discoverTVShowsByGenre(genreId: number, page = 1): Promise<TVShow[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<TVShow>>("/discover/tv", {
      with_genres: genreId.toString(),
      page: page.toString(),
      sort_by: "popularity.desc",
    })
    return response.results
  }

  async discoverMoviesByCountry(countryCode: string, page = 1): Promise<Movie[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<Movie>>("/discover/movie", {
      with_origin_country: countryCode,
      page: page.toString(),
      sort_by: "popularity.desc",
    })
    return response.results
  }

  async discoverTVShowsByCountry(countryCode: string, page = 1): Promise<TVShow[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<TVShow>>("/discover/tv", {
      with_origin_country: countryCode,
      page: page.toString(),
      sort_by: "popularity.desc",
    })
    return response.results
  }

  async getSimilarMovies(movieId: number): Promise<Movie[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<Movie>>(`/movie/${movieId}/similar`)
    return response.results
  }

  async getMovieRecommendations(movieId: number): Promise<Movie[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<Movie>>(
      `/movie/${movieId}/recommendations`
    )
    return response.results
  }

  async getOnTheAirTVShows(page = 1): Promise<TVShow[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<TVShow>>("/tv/on_the_air", {
      page: page.toString(),
    })
    return response.results
  }

  async getAiringTodayTVShows(page = 1): Promise<TVShow[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<TVShow>>("/tv/airing_today", {
      page: page.toString(),
    })
    return response.results
  }

  async getPopularActors(page = 1): Promise<Actor[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<Actor>>("/person/popular", {
      page: page.toString(),
    })
    return response.results
  }

  async getTrendingActors(timeWindow: "day" | "week" = "week", page = 1): Promise<Actor[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<Actor>>(`/trending/person/${timeWindow}`, {
      page: page.toString(),
    })
    return response.results
  }

  async getActorDetails(actorId: number): Promise<ActorDetails> {
    return await this.fetchFromTMDB<ActorDetails>(`/person/${actorId}`, {
      append_to_response: "movie_credits,tv_credits,images",
    })
  }

  async searchActors(query: string, page = 1): Promise<Actor[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<Actor>>("/search/person", {
      query: encodeURIComponent(query),
      page: page.toString(),
    })
    return response.results
  }

  async discoverMedia(options: FilterOptions, page = 1): Promise<MediaItem[]> {
    const params: Record<string, string> = {
      page: page.toString(),
      sort_by: options.sortBy,
    }

    if (options.genres && options.genres.length > 0) {
      params.with_genres = options.genres.join(",")
    }
    if (options.countries && options.countries.length > 0) {
      params.with_origin_country = options.countries.join("|")
    }
    if (options.productionYears && options.productionYears.length > 0) {
      if (options.queryYear) {
        params.primary_release_year = options.queryYear
      } else {
        params.primary_release_year = options.productionYears[0].toString()
      }
    }

    if (options.ageRatings.includes("T18")) {
      params.include_adult = "true"
    } else {
      params.include_adult = "false"
    }

    let movieResults: Movie[] = []
    let tvResults: TVShow[] = []

    if (options.contentTypes.includes("movie") || options.contentTypes.length === 0) {
      const movieResponse = await this.fetchFromTMDB<TMDBResponse<Movie>>("/discover/movie", params)
      movieResults = movieResponse.results.map((m) => ({ ...m, media_type: "movie" as const }))
    }
    if (options.contentTypes.includes("tv") || options.contentTypes.length === 0) {
      const tvResponse = await this.fetchFromTMDB<TMDBResponse<TVShow>>("/discover/tv", params)
      tvResults = tvResponse.results.map((t) => ({ ...t, media_type: "tv" as const }))
    }

    let combinedResults: MediaItem[] = []
    if (options.contentTypes.includes("movie") && options.contentTypes.includes("tv")) {
      combinedResults = [...movieResults, ...tvResults]
    } else if (options.contentTypes.includes("movie")) {
      combinedResults = movieResults
    } else if (options.contentTypes.includes("tv")) {
      combinedResults = tvResults
    } else {
      combinedResults = [...movieResults, ...tvResults]
    }

    if (options.sortBy === "popularity.desc") {
      combinedResults.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    } else if (options.sortBy === "vote_average.desc") {
      combinedResults.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
    } else if (options.sortBy === "primary_release_date.desc") {
      combinedResults.sort((a, b) => {
        const dateA = a.media_type === "movie" ? a.release_date : a.first_air_date
        const dateB = b.media_type === "movie" ? b.release_date : b.first_air_date
        return new Date(dateB || "").getTime() - new Date(dateA || "").getTime()
      })
    } else if (options.sortBy === "vote_count.desc") {
      combinedResults.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
    }

    return combinedResults
  }

  // --- MỚI THÊM: hai hàm với ngôn ngữ tiếng Việt ---

  async getMoviesNowPlaying(): Promise<Movie[]> {
    const res = await this.fetchFromTMDB<TMDBResponse<Movie>>("/movie/now_playing", {
      language: "vi-VN",
      page: "1",
    })
    return res.results
  }

  async getTVOnTheAir(): Promise<TVShow[]> {
    const res = await this.fetchFromTMDB<TMDBResponse<TVShow>>("/tv/on_the_air", {
      language: "vi-VN",
      page: "1",
    })
    return res.results
  }
}

export const tmdbApi = new TMDBApi()
