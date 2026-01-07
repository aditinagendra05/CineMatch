<div align="center">
🎬 Bollywood Movie Recommender
AI-Powered Content-Based Movie Recommendation System
Show Image
Show Image
Show Image
Show Image
<img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License MIT">

Features •
Demo •
Installation •
API Docs •
Contributing

</div>
📖 Overview
A modern, full-stack movie recommendation system that suggests similar Bollywood films using TF-IDF content-based filtering. The system analyzes movie genres and plot overviews to provide intelligent recommendations with a beautiful, Netflix-inspired user interface.
🎯 Key Highlights

🧠 Smart ML Algorithm: TF-IDF vectorization with weighted cosine similarity
🎨 Modern UI/UX: Sleek, responsive design with smooth animations
⚡ Fast Performance: Pre-computed similarity matrices for instant results
🔍 Real-time Search: Autocomplete with live movie suggestions
🎬 Rich Metadata: TMDB API integration for posters, ratings, and details


✨ Features
<table>
<tr>
<td width="50%">
🎯 Recommendation Engine

Content-based filtering using TF-IDF
Weighted similarity (70% genre, 30% overview)
Cosine similarity calculation
Top-N recommendations

</td>
<td width="50%">
🎨 User Interface

Netflix-inspired design
Responsive grid layout
Interactive movie cards
Smooth hover animations
Search with autocomplete

</td>
</tr>
<tr>
<td width="50%">
🔧 Backend API

RESTful Flask API
CORS-enabled endpoints
Pagination support
Error handling & logging
Movie search functionality

</td>
<td width="50%">
📊 Data Integration

TMDB API for movie metadata
Custom Bollywood dataset
Genre classification
Rating & release year
Movie posters & backdrops

</td>
</tr>
</table>

🎥 Demo
Homepage
Browse popular Bollywood movies with rich metadata and interactive cards.
Movie Selection & Recommendations
Click any movie to get personalized recommendations based on content similarity.
Search Functionality
Real-time search with autocomplete dropdown showing matching movies instantly.

🛠️ Tech Stack
Backend
Flask          - Web framework
Pandas         - Data manipulation
scikit-learn   - ML algorithms (TF-IDF, Cosine Similarity)
Flask-CORS     - Cross-origin requests
Frontend
React          - UI library
Lucide React   - Icon components
Tailwind CSS   - Utility-first styling
TMDB API       - Movie database

🚀 Installation
Prerequisites

Python 3.8+
Node.js 14+
npm or yarn

Quick Start
1️⃣ Clone the Repository
bashgit clone https://github.com/yourusername/bollywood-recommender.git
cd bollywood-recommender
2️⃣ Backend Setup
bashcd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install flask flask-cors pandas scikit-learn

# Process the dataset
python load_data.py

# Start Flask server
python app.py
✅ Backend running at http://localhost:5000
3️⃣ Frontend Setup
bashcd frontend

# Install dependencies
npm install

# Start development server
npm start
✅ Frontend running at http://localhost:3000

📁 Project Structure
bollywood-recommender/
│
├── 📂 backend/
│   ├── app.py                              # Flask REST API
│   ├── recommender.py                      # Recommendation engine
│   ├── load_data.py                        # Data preprocessing
│   ├── cleaned_bollywood_movies.csv        # Raw dataset
│   └── cleaned_bollywood_movies_final.csv  # Processed dataset
│
├── 📂 frontend/
│   ├── react.js                            # Main React app
│   ├── package.json                        # Dependencies
│   └── ...
│
└── README.md

🔌 API Documentation
Base URL
http://localhost:5000
Endpoints
<details>
<summary><code>GET /</code> - Health Check</summary>
Response:
json{
  "status": "ok",
  "message": "Bollywood Movie Recommender API is running",
  "endpoints": {
    "/movies": "GET - List all available movies",
    "/recommend": "GET - Get recommendations",
    "/search": "GET - Search movies"
  }
}
</details>
<details>
<summary><code>GET /movies</code> - Get All Movies</summary>
Query Parameters:

page (optional): Page number (default: 1)
per_page (optional): Items per page (default: 50)

Response:
json{
  "total": 1000,
  "page": 1,
  "per_page": 50,
  "movies": ["3 Idiots", "Dangal", "PK", ...]
}
</details>
<details>
<summary><code>GET /recommend</code> - Get Recommendations</summary>
Query Parameters:

movie (required): Movie name
num (optional): Number of recommendations (default: 6, max: 20)

Example:
bashGET /recommend?movie=3%20Idiots&num=6
Response:
json{
  "movie": "3 Idiots",
  "recommendations": ["PK", "Dangal", "Taare Zameen Par", ...],
  "details": [
    {
      "name": "PK",
      "similarity": 0.87
    }
  ],
  "count": 6
}
</details>
<details>
<summary><code>GET /search</code> - Search Movies</summary>
Query Parameters:

query (required): Search term (min 2 characters)

Example:
bashGET /search?query=khan
Response:
json{
  "query": "khan",
  "results": ["3 Idiots", "PK", "Dangal"],
  "count": 3
}
</details>
<details>
<summary><code>GET /movie/:movie_name</code> - Get Movie Details</summary>
Response:
json{
  "name": "3 Idiots",
  "genre": "comedy, drama",
  "overview": "Two friends embark on a quest...",
  "index": 42
}
</details>

🧮 How It Works
Algorithm Workflow
mermaidgraph LR
    A[Raw Dataset] --> B[Data Preprocessing]
    B --> C[TF-IDF Vectorization]
    C --> D[Genre Matrix]
    C --> E[Overview Matrix]
    D --> F[Cosine Similarity]
    E --> F
    F --> G[Weighted Combination<br/>70% Genre + 30% Overview]
    G --> H[Similarity Matrix]
    H --> I[Top-N Recommendations]
Step-by-Step Process

Data Cleaning: Movie titles normalized, genres and overviews cleaned
Feature Extraction: TF-IDF converts text to numerical vectors
Similarity Computation: Cosine similarity calculated for all movie pairs
Weighted Scoring:

Genre similarity: 70% weight
Overview similarity: 30% weight


Recommendation: Return top N most similar movies


⚙️ Configuration
Backend Configuration
Edit app.py to adjust settings:
python# Similarity weights
cosine_sim = 0.7 * cosine_sim_genre + 0.3 * cosine_sim_overview

# Server configuration
app.run(debug=True, host='0.0.0.0', port=5000)

# TF-IDF features
tfidf_overview = TfidfVectorizer(stop_words='english', max_features=5000)
Frontend Configuration
Update API endpoints in react.js:
javascriptconst FLASK_API = 'http://localhost:5000';
const TMDB_API_KEY = 'your_api_key_here';  // Get free key from TMDB
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
Get TMDB API Key

Sign up at themoviedb.org
Go to Settings → API
Request an API key (free for non-commercial use)
Copy the API key to TMDB_API_KEY


🐛 Troubleshooting
Common Issues
<details>
<summary>❌ <code>cleaned_bollywood_movies_final.csv not found</code></summary>
Solution:
bashcd backend
python load_data.py
This preprocesses the raw dataset and creates the final CSV file.
</details>
<details>
<summary>❌ CORS errors in browser console</summary>
Solution:
bashpip install flask-cors
Ensure Flask-CORS is properly installed and configured in app.py.
</details>
<details>
<summary>❌ Movie images not loading</summary>
Causes:

Invalid TMDB API key
No internet connection
Rate limiting from TMDB

Solution:

Verify API key is correct
Check network connectivity
Wait a few minutes if rate limited

</details>
<details>
<summary>❌ Frontend can't connect to backend</summary>
Checklist:

 Backend running on port 5000?
 FLASK_API URL correct in react.js?
 CORS enabled in Flask app?
 Firewall blocking port 5000?

</details>

📊 Dataset Information
Required Columns
Your dataset should include:
ColumnTypeDescriptionmovie_namestringMovie titlegenrestringComma-separated genresoverviewstringPlot description
Data Preprocessing
The load_data.py script:

Removes empty movie names
Cleans and normalizes titles
Standardizes genres and overviews
Removes duplicates
Handles missing values


🎨 UI Features
Interactive Elements

Hover Effects: Movie cards scale and show additional details on hover
Smooth Animations: Fade-in effects and transitions throughout
Search Dropdown: Real-time results with movie thumbnails
Hero Section: Large backdrop display for selected movies
Responsive Grid: Adapts from 2 to 6 columns based on screen size
Loading States: Spinner and skeleton screens during data fetch

Design System

Color Palette: Black background with red accent colors
Typography: Modern, readable fonts with proper hierarchy
Icons: Lucide React icon library
Shadows: Depth and elevation through shadow effects
Blur Effects: Glassmorphism with backdrop blur


🤝 Contributing
We welcome contributions! Here's how you can help:
How to Contribute

🍴 Fork the repository
🌿 Create a feature branch

bash   git checkout -b feature/AmazingFeature

💾 Commit your changes

bash   git commit -m 'Add some AmazingFeature'

📤 Push to the branch

bash   git push origin feature/AmazingFeature

🎉 Open a Pull Request

Contribution Ideas

🎯 Add user ratings and reviews
📱 Build mobile app version
🔐 Implement user authentication
📊 Add analytics dashboard
🌐 Multi-language support
🎬 Video trailer integration
⭐ Watchlist and favorites feature
🤖 Collaborative filtering algorithm


📜 License
This project is licensed under the MIT License - see the LICENSE file for details.
MIT License - Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...

🙏 Acknowledgments
Special thanks to:

The Movie Database (TMDB) - Movie data and images
scikit-learn - Machine learning tools
Flask - Web framework
React - UI library
Lucide - Beautiful icons
Tailwind CSS - Styling framework

And the amazing Bollywood film industry! 🎬




<div align="center">
⭐ Star this repository if you found it helpful!
Made with ❤️ for Bollywood movie lovers
⬆ Back to Top
</div>
