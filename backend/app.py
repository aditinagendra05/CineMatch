from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# ==================== Load and Prepare Data ====================
try:
    # Load the cleaned dataset
    movies = pd.read_csv('cleaned_bollywood_movies_final.csv')
    logger.info(f"Loaded {len(movies)} movies from dataset")
    
    # Fill NaN values with empty strings
    movies['genre'] = movies['genre'].fillna('')
    movies['overview'] = movies['overview'].fillna('')
    
    # Create TF-IDF matrices
    tfidf_genre = TfidfVectorizer(stop_words='english')
    genre_matrix = tfidf_genre.fit_transform(movies['genre'])
    
    tfidf_overview = TfidfVectorizer(stop_words='english', max_features=5000)
    overview_matrix = tfidf_overview.fit_transform(movies['overview'])
    
    # Compute cosine similarities
    cosine_sim_genre = cosine_similarity(genre_matrix, genre_matrix)
    cosine_sim_overview = cosine_similarity(overview_matrix, overview_matrix)
    
    # Weighted similarity (70% genre, 30% overview)
    cosine_sim = 0.7 * cosine_sim_genre + 0.3 * cosine_sim_overview
    
    logger.info("Successfully computed similarity matrices")
    
except FileNotFoundError:
    logger.error("cleaned_bollywood_movies_final.csv not found!")
    movies = None
    cosine_sim = None
except Exception as e:
    logger.error(f"Error loading data: {str(e)}")
    movies = None
    cosine_sim = None


# ==================== Helper Functions ====================
def get_movie_index(movie_name):
    """Find movie index by name (case-insensitive)"""
    movie_name_lower = movie_name.lower().strip()
    
    # Try exact match first
    for idx, name in enumerate(movies['movie_name'].values):
        if name.lower().strip() == movie_name_lower:
            return idx
    
    # Try partial match
    for idx, name in enumerate(movies['movie_name'].values):
        if movie_name_lower in name.lower() or name.lower() in movie_name_lower:
            return idx
    
    return None


def recommend_movies(movie_name, num_recommendations=6):
    """Generate movie recommendations based on similarity"""
    if movies is None or cosine_sim is None:
        raise Exception("Movie database not loaded properly")
    
    # Find movie index
    idx = get_movie_index(movie_name)
    
    if idx is None:
        # Try title case
        movie_name_title = movie_name.title()
        idx = get_movie_index(movie_name_title)
    
    if idx is None:
        raise ValueError(f"Movie '{movie_name}' not found in database")
    
    # Get similarity scores
    sim_scores = list(enumerate(cosine_sim[idx]))
    
    # Sort by similarity (descending)
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    
    # Get top N recommendations (skip the movie itself)
    sim_scores = sim_scores[1:num_recommendations + 1]
    
    # Get movie indices
    movie_indices = [i[0] for i in sim_scores]
    
    # Return movie names and similarity scores
    recommendations = []
    for i in movie_indices:
        recommendations.append({
            'name': movies['movie_name'].iloc[i],
            'similarity': float(sim_scores[movie_indices.index(i)][1])
        })
    
    return recommendations


# ==================== API Routes ====================

@app.route('/')
def home():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'Bollywood Movie Recommender API is running',
        'endpoints': {
            '/movies': 'GET - List all available movies',
            '/recommend': 'GET - Get recommendations (params: movie, num)',
            '/search': 'GET - Search movies (params: query)'
        }
    })


@app.route('/movies', methods=['GET'])
def get_movies():
    """Get list of all available movies"""
    if movies is None:
        return jsonify({'error': 'Movie database not loaded'}), 500
    
    try:
        movie_list = movies['movie_name'].tolist()
        
        # Optional: add pagination
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        start = (page - 1) * per_page
        end = start + per_page
        
        return jsonify({
            'total': len(movie_list),
            'page': page,
            'per_page': per_page,
            'movies': movie_list[start:end]
        })
    except Exception as e:
        logger.error(f"Error in /movies: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/recommend', methods=['GET'])
def get_recommendations():
    """Get movie recommendations"""
    if movies is None or cosine_sim is None:
        return jsonify({'error': 'Movie database not loaded'}), 500
    
    # Get parameters
    movie_name = request.args.get('movie')
    num_recommendations = request.args.get('num', 6, type=int)
    
    # Validate parameters
    if not movie_name:
        return jsonify({'error': 'Movie name is required'}), 400
    
    if num_recommendations < 1 or num_recommendations > 20:
        return jsonify({'error': 'Number of recommendations must be between 1 and 20'}), 400
    
    try:
        # Get recommendations
        recommendations = recommend_movies(movie_name, num_recommendations)
        
        return jsonify({
            'movie': movie_name,
            'recommendations': [rec['name'] for rec in recommendations],
            'details': recommendations,
            'count': len(recommendations)
        })
    
    except ValueError as e:
        logger.warning(f"Movie not found: {movie_name}")
        return jsonify({
            'error': str(e),
            'suggestion': 'Try searching for the movie first using /search endpoint'
        }), 404
    
    except Exception as e:
        logger.error(f"Error in /recommend: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/search', methods=['GET'])
def search_movies():
    """Search for movies by name"""
    if movies is None:
        return jsonify({'error': 'Movie database not loaded'}), 500
    
    query = request.args.get('query', '').lower().strip()
    
    if not query:
        return jsonify({'error': 'Search query is required'}), 400
    
    if len(query) < 2:
        return jsonify({'error': 'Search query must be at least 2 characters'}), 400
    
    try:
        # Search for movies containing the query
        results = []
        for movie_name in movies['movie_name'].values:
            if query in movie_name.lower():
                results.append(movie_name)
        
        return jsonify({
            'query': query,
            'results': results,
            'count': len(results)
        })
    
    except Exception as e:
        logger.error(f"Error in /search: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/movie/<movie_name>', methods=['GET'])
def get_movie_details(movie_name):
    """Get details of a specific movie"""
    if movies is None:
        return jsonify({'error': 'Movie database not loaded'}), 500
    
    try:
        idx = get_movie_index(movie_name)
        
        if idx is None:
            return jsonify({'error': f"Movie '{movie_name}' not found"}), 404
        
        movie_data = movies.iloc[idx]
        
        return jsonify({
            'name': movie_data['movie_name'],
            'genre': movie_data.get('genre', 'N/A'),
            'overview': movie_data.get('overview', 'N/A'),
            'index': int(idx)
        })
    
    except Exception as e:
        logger.error(f"Error in /movie: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


# ==================== Run Server ====================
if __name__ == '__main__':
    if movies is None or cosine_sim is None:
        logger.error("Failed to load movie data. Please check if 'cleaned_bollywood_movies_final.csv' exists.")
    else:
        logger.info(f"Starting Flask server with {len(movies)} movies...")
        logger.info("API available at http://localhost:5000")
        app.run(debug=True, host='0.0.0.0', port=5000)