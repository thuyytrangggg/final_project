export interface Movie {
  id: number
  title: string
  poster_path?: string
  backdrop_path?: string
  vote_average: number
  release_date: string
  overview?: string
  genre_ids?: number[]
  genres?: Genre[]
  runtime?: number
  director?: string
  cast?: Cast[]
  videos?: Video[]
  adult: boolean
  original_language: string
  original_title: string
  popularity: number
  vote_count: number
}

export interface Genre {
  id: number
  name: string
}

export interface Cast {
  id: number
  name: string
  character: string
  profile_path?: string
}

export interface Video {
  id: string
  key: string
  name: string
  site: string
  type: string
}

export interface TMDBResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export interface MovieDetails extends Movie {
  belongs_to_collection?: any
  budget: number
  homepage?: string
  imdb_id?: string
  production_companies: ProductionCompany[]
  production_countries: ProductionCountry[]
  revenue: number
  spoken_languages: SpokenLanguage[]
  status: string
  tagline?: string
}

export interface ProductionCompany {
  id: number
  logo_path?: string
  name: string
  origin_country: string
}

export interface ProductionCountry {
  iso_3166_1: string
  name: string
}

export interface SpokenLanguage {
  english_name: string
  iso_639_1: string
  name: string
}

export interface MovieCardProps {
  movie: Movie
}

export interface MovieGridProps {
  title: string
  movies: Movie[]
}

// TV Show interfaces
export interface TVShow {
  id: number
  name: string
  poster_path?: string
  backdrop_path?: string
  vote_average: number
  first_air_date: string
  overview?: string
  genre_ids?: number[]
  genres?: Genre[]
  episode_run_time?: number[]
  created_by?: Creator[]
  cast?: Cast[]
  videos?: Video[]
  adult: boolean
  original_language: string
  original_name: string
  popularity: number
  vote_count: number
}

export interface Creator {
  id: number
  name: string
  profile_path?: string
}

// Combined type for movies and TV shows
export interface MediaItem extends Omit<Movie, "title" | "release_date"> {
  title?: string
  name?: string
  release_date?: string
  first_air_date?: string
  media_type?: "movie" | "tv"
}

// Actor/Person interfaces
export interface Actor {
  id: number
  name: string
  profile_path?: string
  popularity: number
  known_for_department: string
  known_for: MediaItem[]
  adult: boolean
  gender: number
}

export interface ActorDetails extends Actor {
  biography: string
  birthday?: string
  deathday?: string
  place_of_birth?: string
  homepage?: string
  imdb_id?: string
  also_known_as: string[]
}
