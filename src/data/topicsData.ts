export interface TopicData {
  id: number
  name: string
  background: string
  genreIds: number[]
  description: string
}

export const topicsData: TopicData[] = [
  {
    id: 1,
    name: "War",
    background: "linear-gradient(135deg, #8B4513, #A0522D)",
    genreIds: [10752, 28, 10768], // War, Action, War & Politics
    description: "Epic war stories and military action",
  },
  {
    id: 2,
    name: "Fantasy",
    background: "linear-gradient(135deg, #4169E1, #6495ED)",
    genreIds: [878, 14, 10765], // Science Fiction, Fantasy, Sci-Fi & Fantasy
    description: "Futuristic adventures and fantasy worlds",
  },
  {
    id: 3,
    name: "Feel-Good",
    background: "linear-gradient(135deg, #FFB6C1, #FFA07A)",
    genreIds: [10751, 35, 10402, 10749, 10762], // Family, Comedy, Music, Romance, Kids, Adventure
    description: "Uplifting and heartwarming stories",
  },
  {
    id: 4,
    name: "Thrilling",
    background: "linear-gradient(135deg, #DC143C, #B22222)",
    genreIds: [28, 12, 80, 18, 27, 53, 10752, 10759, 10768], // Action, Adventure, Crime, Drama, Horror, Thriller, War, Action & Adventure, War & Politics
    description: "Heart-pounding action and suspense",
  },
  {
    id: 5,
    name: "Documentary & History",
    background: "linear-gradient(135deg, #708090, #778899)",
    genreIds: [99, 36, 10763, 10764, 10768], // Documentary, History, News, Reality, War & Politics
    description: "Real-life stories and factual content",
  },
  {
    id: 6,
    name: "Kids & Family",
    background: "linear-gradient(135deg, #32CD32, #98FB98)",
    genreIds: [16, 35, 10751, 10402, 770, 10762, 10767], // Animation, Comedy, Family, Music, TV Movie, Kids, Talk
    description: "Fun content for the whole family",
  },
  {
    id: 7,
    name: "Adult",
    background: "linear-gradient(135deg, #8B0000, #A52A2A)",
    genreIds: [18, 80, 27, 53], // Drama, Crime, Horror, Thriller (18+ content)
    description: "Mature content for adult audiences",
  },
  {
    id: 8,
    name: "Teen",
    background: "linear-gradient(135deg, #9370DB, #BA55D3)",
    genreIds: [14, 27, 9648, 10749, 878, 28, 12, 16, 80, 18, 53, 10759, 10765, 10766], // Fantasy, Horror, Mystery, Romance, Science Fiction, Action, Adventure, Animation, Crime, Drama, Thriller, Action & Adventure, Sci-Fi & Fantasy, Soap
    description: "Perfect for teenage audiences",
  },
  {
    id: 9,
    name: "Blockbuster",
    background: "linear-gradient(135deg, #FFD700, #FFA500)",
    genreIds: [28, 12, 878, 14, 53], // Action, Adventure, Science Fiction, Fantasy, Thriller (high budget films)
    description: "Big budget blockbuster movies",
  },
  {
    id: 10,
    name: "Classic",
    background: "linear-gradient(135deg, #CD853F, #D2691E)",
    genreIds: [18, 10749, 35, 9648, 36], // Drama, Romance, Comedy, Mystery, History (classic films)
    description: "Timeless classics and award winners",
  },
]
