import pandas as pd
import re

# -------------------- Step 1: Load CSV --------------------
movies = pd.read_csv('cleaned_bollywood_movies.csv')

# -------------------- Step 2: Drop rows with empty movie_name --------------------
movies = movies[movies['movie_name'].notna()]
movies = movies[movies['movie_name'].str.strip() != '']

# -------------------- Step 3: Clean movie_name --------------------
def clean_movie_title(title):
    if pd.isnull(title) or title.strip() == '':
        return ''
    title = title.strip().lower()
    # Remove unwanted words
    title = title.replace('untitled', '').replace('movie', '')
    # Take only first part before slash, dash, or parentheses
    title = re.split(r'[/\-\(]', title)[0]
    # Remove extra spaces
    title = ' '.join(title.split())
    return title.title()

movies['movie_name'] = movies['movie_name'].apply(clean_movie_title)

# -------------------- Step 4: Drop rows that became empty --------------------
movies = movies[movies['movie_name'] != '']

# -------------------- Step 5: Clean other text columns --------------------
def clean_text(text):
    if pd.isnull(text):
        return ''
    text = text.lower()
    text = text.replace('/', ',')
    text = ' '.join(text.split())
    return text

movies['genre'] = movies['genre'].apply(clean_text)
movies['overview'] = movies['overview'].apply(clean_text)

# -------------------- Step 6: Save cleaned CSV --------------------
movies.to_csv('cleaned_bollywood_movies_final.csv', index=False)

print("Cleaned dataset saved to cleaned_bollywood_movies_final.csv")
print(movies['movie_name'].head(20))
