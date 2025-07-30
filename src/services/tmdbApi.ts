// TMDB API service
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
} from "../types/mediaTypes"

class TMDBApi {
  private async fetchFromTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`)
    url.searchParams.append("api_key", API_CONFIG.API_KEY)

    // Add additional parameters
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

  // Get trending movies and TV shows
  async getTrending(
    mediaType: "all" | "movie" | "tv" = "all",
    timeWindow: "day" | "week" = "week",
  ): Promise<MediaItem[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<MediaItem>>(`/trending/${mediaType}/${timeWindow}`)
    return response.results
  }

  // Get popular movies
  async getPopularMovies(page = 1): Promise<Movie[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<Movie>>("/movie/popular", {
      page: page.toString(),
    })
    return response.results
  }

  // Get popular TV shows
  async getPopularTVShows(page = 1): Promise<TVShow[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<TVShow>>("/tv/popular", {
      page: page.toString(),
    })
    return response.results
  }

  // Get now playing movies
  async getNowPlayingMovies(page = 1): Promise<Movie[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<Movie>>("/movie/now_playing", {
      page: page.toString(),
    })
    return response.results
  }

  // Get upcoming movies
  async getUpcomingMovies(page = 1): Promise<Movie[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<Movie>>("/movie/upcoming", {
      page: page.toString(),
    })
    return response.results
  }

  // Get top rated movies
  async getTopRatedMovies(page = 1): Promise<Movie[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<Movie>>("/movie/top_rated", {
      page: page.toString(),
    })
    return response.results
  }

  // Get top rated TV shows
  async getTopRatedTVShows(page = 1): Promise<TVShow[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<TVShow>>("/tv/top_rated", {
      page: page.toString(),
    })
    return response.results
  }

  // Get movie details
  async getMovieDetails(
    movieId: number,
  ): Promise<MovieDetails & { credits?: { cast: Cast[] }; videos?: { results: Video[] } }> {
    return await this.fetchFromTMDB<MovieDetails & { credits?: { cast: Cast[] }; videos?: { results: Video[] } }>(
      `/movie/${movieId}`,
      {
        append_to_response: "credits,videos,similar,recommendations",
      },
    )
  }

  // Get TV show details
  async getTVShowDetails(
    tvId: number,
  ): Promise<TVShow & { credits?: { cast: Cast[] }; videos?: { results: Video[] } }> {
    return await this.fetchFromTMDB<TVShow & { credits?: { cast: Cast[] }; videos?: { results: Video[] } }>(
      `/tv/${tvId}`,
      {
        append_to_response: "credits,videos,similar,recommendations",
      },
    )
  }

  // Get movie credits
  async getMovieCredits(movieId: number): Promise<{ cast: Cast[]; crew: any[] }> {
    return await this.fetchFromTMDB<{ cast: Cast[]; crew: any[] }>(`/movie/${movieId}/credits`)
  }

  // Get movie videos
  async getMovieVideos(movieId: number): Promise<{ results: Video[] }> {
    return await this.fetchFromTMDB<{ results: Video[] }>(`/movie/${movieId}/videos`)
  }

  // Get movie genres
  async getMovieGenres(): Promise<Genre[]> {
    const response = await this.fetchFromTMDB<{ genres: Genre[] }>("/genre/movie/list")
    return response.genres
  }

  // Get TV genres
  async getTVGenres(): Promise<Genre[]> {
    const response = await this.fetchFromTMDB<{ genres: Genre[] }>("/genre/tv/list")
    return response.genres
  }

  // Search movies
  async searchMovies(query: string, page = 1): Promise<Movie[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<Movie>>("/search/movie", {
      query: encodeURIComponent(query),
      page: page.toString(),
    })
    return response.results
  }

  // Search TV shows
  async searchTVShows(query: string, page = 1): Promise<TVShow[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<TVShow>>("/search/tv", {
      query: encodeURIComponent(query),
      page: page.toString(),
    })
    return response.results
  }

  // Search movies and TV shows
  async searchMulti(query: string, page = 1): Promise<MediaItem[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<MediaItem>>("/search/multi", {
      query: encodeURIComponent(query),
      page: page.toString(),
    })
    return response.results.filter((item) => item.media_type === "movie" || item.media_type === "tv")
  }

  // Discover movies by genre
  async discoverMoviesByGenre(genreId: number, page = 1): Promise<Movie[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<Movie>>("/discover/movie", {
      with_genres: genreId.toString(),
      page: page.toString(),
      sort_by: "popularity.desc",
    })
    return response.results
  }

  // Discover TV shows by genre
  async discoverTVShowsByGenre(genreId: number, page = 1): Promise<TVShow[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<TVShow>>("/discover/tv", {
      with_genres: genreId.toString(),
      page: page.toString(),
      sort_by: "popularity.desc",
    })
    return response.results
  }

  // Discover movies by country
  async discoverMoviesByCountry(countryCode: string, page = 1): Promise<Movie[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<Movie>>("/discover/movie", {
      with_origin_country: countryCode,
      page: page.toString(),
      sort_by: "popularity.desc",
    })
    return response.results
  }

  // Discover TV shows by country
  async discoverTVShowsByCountry(countryCode: string, page = 1): Promise<TVShow[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<TVShow>>("/discover/tv", {
      with_origin_country: countryCode,
      page: page.toString(),
      sort_by: "popularity.desc",
    })
    return response.results
  }

  // Get similar movies
  async getSimilarMovies(movieId: number): Promise<Movie[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<Movie>>(`/movie/${movieId}/similar`)
    return response.results
  }

  // Get movie recommendations
  async getMovieRecommendations(movieId: number): Promise<Movie[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<Movie>>(`/movie/${movieId}/recommendations`)
    return response.results
  }

  // Get on the air TV shows
  async getOnTheAirTVShows(page = 1): Promise<TVShow[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<TVShow>>("/tv/on_the_air", {
      page: page.toString(),
    })
    return response.results
  }

  // Get airing today TV shows
  async getAiringTodayTVShows(page = 1): Promise<TVShow[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<TVShow>>("/tv/airing_today", {
      page: page.toString(),
    })
    return response.results
  }

  // Get popular actors
  async getPopularActors(page = 1): Promise<Actor[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<Actor>>("/person/popular", {
      page: page.toString(),
    })
    return response.results
  }

  // Get trending actors
  async getTrendingActors(timeWindow: "day" | "week" = "week", page = 1): Promise<Actor[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<Actor>>(`/trending/person/${timeWindow}`, {
      page: page.toString(),
    })
    return response.results
  }

  // Get actor details
  async getActorDetails(actorId: number): Promise<ActorDetails> {
    return await this.fetchFromTMDB<ActorDetails>(`/person/${actorId}`, {
      append_to_response: "movie_credits,tv_credits,images",
    })
  }

  // Search actors
  async searchActors(query: string, page = 1): Promise<Actor[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<Actor>>("/search/person", {
      query: encodeURIComponent(query),
      page: page.toString(),
    })
    return response.results
  }
}

export const tmdbApi = new TMDBApi()
