import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# -------------------- Step 1: Load cleaned dataset --------------------
movies = pd.read_csv('cleaned_bollywood_movies_final.csv')

# Fill NaN values with empty strings
movies['genre'] = movies['genre'].fillna('')
movies['overview'] = movies['overview'].fillna('')

# -------------------- Step 2: TF-IDF for genre and overview separately --------------------
tfidf_genre = TfidfVectorizer(stop_words='english')
genre_matrix = tfidf_genre.fit_transform(movies['genre'])

tfidf_overview = TfidfVectorizer(stop_words='english')
overview_matrix = tfidf_overview.fit_transform(movies['overview'])

# -------------------- Step 3: Compute cosine similarities --------------------
cosine_sim_genre = cosine_similarity(genre_matrix, genre_matrix)
cosine_sim_overview = cosine_similarity(overview_matrix, overview_matrix)

# -------------------- Step 4: Weighted similarity --------------------
# Genre more important than overview
cosine_sim = 0.7 * cosine_sim_genre + 0.3 * cosine_sim_overview

# -------------------- Step 5: Recommendation function --------------------
def recommend(movie_name, num_recommendations=5):
    movie_name = movie_name.title()
    if movie_name not in movies['movie_name'].values:
        print(f"Movie '{movie_name}' not found in dataset!")
        return []

    idx = movies[movies['movie_name'] == movie_name].index[0]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:num_recommendations+1]  # skip the movie itself
    movie_indices = [i[0] for i in sim_scores]
    return movies['movie_name'].iloc[movie_indices].tolist()

# -------------------- Step 6: Test the recommender --------------------
if __name__ == "__main__":
    test_movie = 'Rocky Aur Rani Kii Prem Kahaani'  # replace with any movie from your dataset
    recommendations = recommend(test_movie)
    print(f"Recommendations for '{test_movie}':")
    for movie in recommendations:
        print(movie)
