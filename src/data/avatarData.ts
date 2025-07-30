// Sample data for Avatar movie
export const avatarMovie = {
  id: 1,
  title: "Avatar: The Way of Water",
  overview:
    "Set more than a decade after the events of the first film, Avatar: The Way of Water begins to tell the story of the Sully family (Jake, Neytiri, and their kids), the trouble that follows them, the lengths they go to keep each other safe, the battles they fight to stay alive, and the tragedies they endure.",
  backdrop_path: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-SWsmd8bCziyyfkaLtbB4lTlY6xQYbO.png",
  poster_path: "/placeholder.svg?height=600&width=400",
  release_date: "2022-12-16",
  vote_average: 8.5,
  genres: [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 878, name: "Science Fiction" },
  ],
  media_type: "movie",
  runtime: 192, // 3 hours 12 minutes
}

export const movieGenres: { [key: number]: string } = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
}
