import React, { useState, useEffect } from 'react';
import { Search, Play, Star, Calendar, Film, Sparkles, TrendingUp } from 'lucide-react';

const TMDB_API_KEY = '8265bd1679663a7ea12ac168da84d2e8'; // Free API key for demo
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const FLASK_API = 'http://localhost:5000';

const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allMovies, setAllMovies] = useState([]);
  const [displayMovies, setDisplayMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchDropdown, setSearchDropdown] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAvailableMovies();
  }, []);

  const fetchAvailableMovies = async () => {
    try {
      const response = await fetch(`${FLASK_API}/movies`);
      const data = await response.json();
      
      if (data.movies) {
        const moviesWithTMDB = await Promise.all(
          data.movies.slice(0, 24).map(async (movieName) => {
            const tmdbData = await fetchTMDBData(movieName);
            return tmdbData;
          })
        );
        
        const validMovies = moviesWithTMDB.filter(m => m !== null);
        setAllMovies(validMovies);
        setDisplayMovies(validMovies);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      loadFallbackMovies();
    }
  };

  const loadFallbackMovies = async () => {
    const fallbackList = [
      '3 Idiots', 'Dangal', 'PK', 'Bajrangi Bhaijaan', 'Kabir Singh',
      'Pathaan', 'Jawan', 'Tiger 3', 'War', 'Dhoom 3',
      'Krrish 3', 'Chennai Express', 'Happy New Year', 'Singham',
      'Golmaal Again', 'Housefull 4', 'Total Dhamaal', 'Judwaa 2'
    ];
    
    const movies = await Promise.all(
      fallbackList.map(async (name) => await fetchTMDBData(name))
    );
    
    const validMovies = movies.filter(m => m !== null);
    setAllMovies(validMovies);
    setDisplayMovies(validMovies);
  };

  const fetchTMDBData = async (movieName) => {
    try {
      const searchQuery = movieName.includes('hindi') ? movieName : `${movieName} hindi`;
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}&language=en-US`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const movie = data.results[0];
        
        const genreResponse = await fetch(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}`
        );
        const genreData = await genreResponse.json();
        const genreMap = {};
        genreData.genres.forEach(g => genreMap[g.id] = g.name);
        
        const genres = movie.genre_ids?.map(id => genreMap[id]).filter(Boolean).join(', ') || 'Drama';
        
        return {
          id: movie.id,
          title: movieName,
          originalTitle: movie.title,
          poster: movie.poster_path 
            ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
            : `https://via.placeholder.com/300x450/1a1a1a/e50914?text=${encodeURIComponent(movieName)}`,
          backdrop: movie.backdrop_path 
            ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
            : null,
          year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
          genre: genres,
          rating: movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
          overview: movie.overview || 'A Bollywood masterpiece.',
          voteCount: movie.vote_count || 0
        };
      }
      
      return {
        id: Date.now(),
        title: movieName,
        originalTitle: movieName,
        poster: `https://via.placeholder.com/300x450/1a1a1a/e50914?text=${encodeURIComponent(movieName)}`,
        backdrop: null,
        year: '2023',
        genre: 'Drama',
        rating: '7.5',
        overview: 'A captivating Bollywood film.',
        voteCount: 1000
      };
    } catch (error) {
      console.error('Error fetching TMDB data:', error);
      return null;
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length > 1) {
      const filtered = allMovies.filter(m => 
        m.title.toLowerCase().includes(query.toLowerCase()) ||
        m.originalTitle.toLowerCase().includes(query.toLowerCase())
      );
      setSearchDropdown(filtered.slice(0, 5));
    } else {
      setSearchDropdown([]);
    }
  };

  const handleMovieSelect = async (movie) => {
    setSelectedMovie(movie);
    setSearchDropdown([]);
    setSearchQuery('');
    setLoading(true);
    setError(null);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    try {
      const response = await fetch(
        `${FLASK_API}/recommend?movie=${encodeURIComponent(movie.title)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      const data = await response.json();
      
      if (data.recommendations && data.recommendations.length > 0) {
        const recsWithTMDB = await Promise.all(
          data.recommendations.map(async (movieName) => {
            return await fetchTMDBData(movieName);
          })
        );
        
        setRecommendations(recsWithTMDB.filter(m => m !== null));
      } else {
        setError('No recommendations found for this movie.');
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Unable to fetch recommendations. Please try another movie.');
      
      const fallbackRecs = allMovies
        .filter(m => m.id !== movie.id && m.genre === movie.genre)
        .slice(0, 6);
      setRecommendations(fallbackRecs);
    } finally {
      setLoading(false);
    }
  };

  const MovieCard = ({ movie, size = 'normal' }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        className={`group relative cursor-pointer transition-all duration-300 ${
          size === 'large' ? 'w-full md:w-80' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => handleMovieSelect(movie)}
      >
        <div className={`relative overflow-hidden rounded-lg transition-all duration-300 ${
          isHovered ? 'scale-105 shadow-2xl shadow-red-900/50 ring-2 ring-red-600' : 'shadow-lg'
        }`}>
          <img
            src={movie.poster}
            alt={movie.title}
            className={`w-full ${size === 'large' ? 'h-[500px]' : 'h-[380px]'} object-cover`}
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/300x450/1a1a1a/e50914?text=${encodeURIComponent(movie.title)}`;
            }}
          />
          
          <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">{movie.title}</h3>
              
              <div className="flex items-center gap-3 text-sm text-gray-300 mb-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{movie.year}</span>
                </div>
                {movie.rating !== 'N/A' && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span>{movie.rating}</span>
                  </div>
                )}
              </div>
              
              <p className="text-gray-400 text-xs mb-3 line-clamp-1">{movie.genre}</p>
              
              <button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2.5 rounded-md flex items-center justify-center gap-2 transition-all font-semibold">
                <Sparkles className="w-4 h-4" />
                Get Recommendations
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-3 px-1">
          <h3 className="text-white font-semibold truncate text-sm">{movie.title}</h3>
          <p className="text-gray-400 text-xs truncate">{movie.genre}</p>
        </div>
        
        {!isHovered && (
          <div className="absolute top-3 right-3 bg-black/90 text-white px-2 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
            Find similar
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-600 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black via-black/95 to-transparent backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-3">
              <Film className="w-8 h-8 text-red-600" />
              <h1 className="text-2xl md:text-3xl font-bold">
                <span className="bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 bg-clip-text text-transparent">
                  BOLLYWOOD
                </span>
                <span className="text-white ml-2">RECOMMENDER</span>
              </h1>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative max-w-3xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
            <input
              type="text"
              placeholder="Search for a Bollywood movie..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full bg-gray-900/90 border-2 border-gray-800 rounded-full py-3 md:py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/30 transition-all backdrop-blur-sm"
            />
            
            {/* Search Dropdown */}
            {searchDropdown.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-gray-900/95 border-2 border-gray-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md z-50">
                {searchDropdown.map((movie, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleMovieSelect(movie)}
                    className="flex items-center gap-4 p-3 hover:bg-red-900/30 cursor-pointer transition-all border-b border-gray-800 last:border-b-0"
                  >
                    <img 
                      src={movie.poster} 
                      alt={movie.title} 
                      className="w-12 h-16 object-cover rounded shadow-lg"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/50x75/1a1a1a/e50914?text=?`;
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm">{movie.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <span>{movie.year}</span>
                        <span>•</span>
                        <span className="truncate">{movie.genre}</span>
                      </div>
                    </div>
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-white font-semibold text-sm">{movie.rating}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-36 md:pt-44 pb-20 relative z-10">
        
        {/* Hero Section with Selected Movie */}
        {selectedMovie && (
          <section className="mb-12 animate-fadeIn">
            <div className="relative rounded-2xl overflow-hidden mb-8">
              {selectedMovie.backdrop && (
                <div className="absolute inset-0">
                  <img 
                    src={selectedMovie.backdrop} 
                    alt={selectedMovie.title}
                    className="w-full h-full object-cover opacity-20"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
                </div>
              )}
              
              <div className="relative flex flex-col md:flex-row gap-6 p-6 md:p-8">
                <img 
                  src={selectedMovie.poster}
                  alt={selectedMovie.title}
                  className="w-48 h-72 object-cover rounded-lg shadow-2xl mx-auto md:mx-0"
                />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Selected Movie</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">{selectedMovie.title}</h2>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5 bg-yellow-500/20 px-3 py-1.5 rounded-full">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-bold text-yellow-500">{selectedMovie.rating}</span>
                    </div>
                    <span className="text-gray-400">{selectedMovie.year}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400">{selectedMovie.genre}</span>
                  </div>
                  
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6">
                    {selectedMovie.overview}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations Carousel */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-red-600" />
                <span className="text-gray-400">Because you watched</span>
                <span className="text-red-600">{selectedMovie.title}</span>
              </h2>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mb-4"></div>
                <p className="text-gray-400">Finding perfect recommendations...</p>
              </div>
            ) : error ? (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
                <p className="text-red-400">{error}</p>
              </div>
            ) : (
              <div className="relative">
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                  {recommendations.map((movie, idx) => (
                    <div key={idx} className="flex-none w-56 snap-start">
                      <MovieCard movie={movie} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Popular Movies Grid */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-red-600" />
            <h2 className="text-xl md:text-2xl font-bold">
              {selectedMovie ? 'Explore More Movies' : 'Popular Bollywood Movies'}
            </h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {displayMovies.map((movie, idx) => (
              <MovieCard key={idx} movie={movie} />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-t from-gray-900 to-transparent border-t border-gray-800 py-8 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
            <Sparkles className="w-4 h-4" />
            <p className="font-semibold">Powered by TF-IDF Content-Based Filtering</p>
          </div>
          <p className="text-sm text-gray-500">Movie data from The Movie Database (TMDB)</p>
        </div>
      </footer>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default App;