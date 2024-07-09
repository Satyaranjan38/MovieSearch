// Function to fetch OAuth token
async function fetchOAuthToken(clientId, clientSecret, tokenUrl) {
    const body = `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`;
    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
    });
    const data = await response.json();
    return data.access_token;
}

// Function to handle API request with OAuth token
document.getElementById('search-button').addEventListener('click', async function() {
    const query = document.getElementById('search-input').value;
    const clientId = 'sb-na-20e3ce3b-94a8-412b-ae95-e3e44623bf39!t292265';
    const clientSecret = 'yKZJl9AELfxltYhL+PcgK2lVGBw=';
    const tokenUrl = 'https://10db0aa4trial.authentication.us10.hana.ondemand.com/oauth/token';

    try {
        // Fetch OAuth token
        const token = await fetchOAuthToken(clientId, clientSecret, tokenUrl);

        // Make API request with token
        const response = await fetch(`https://MovieSearch.cfapps.us10-001.hana.ondemand.com/search?query=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // Handle response
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        displayResults(data.results);
    } catch (error) {
        console.error('Error:', error);
    }
});

// Function to display search results
function displayResults(movies) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';

        movieCard.addEventListener('click', () => {
            window.location.href = 'https://t.me/moviesearchgroup777';
        });

        const movieImg = document.createElement('img');
        movieImg.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        movieCard.appendChild(movieImg);

        const movieTitle = document.createElement('h2');
        movieTitle.textContent = movie.title;
        movieCard.appendChild(movieTitle);

        const movieOverview = document.createElement('p');
        movieOverview.textContent = movie.overview;
        movieOverview.className = 'movie-description';
        movieCard.appendChild(movieOverview);

        const moviePopularity = document.createElement('p');
        moviePopularity.className = 'movie-popularity';
        moviePopularity.innerHTML = `Popularity: <span>${movie.popularity}</span>`;
        movieCard.appendChild(moviePopularity);

        const movieReleaseDate = document.createElement('p');
        movieReleaseDate.className = 'movie-release-date';
        movieReleaseDate.innerHTML = `Release Date: <span>${movie.release_date}</span>`;
        movieCard.appendChild(movieReleaseDate);

        const movieLanguage = document.createElement('p');
        movieLanguage.className = 'movie-language';
        movieLanguage.innerHTML = `Original Language: <span>${movie.original_language}</span>`;
        movieCard.appendChild(movieLanguage);

        resultsDiv.appendChild(movieCard);
    });
}


async function fetchRecentMovies() {
    try {
        const response = await fetch('http://localhost:8086/recentMovies', {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        displayResults(data.results, 'recent-movies');
    } catch (error) {
        console.error('Error fetching recent movies:', error);
    }
}

// Fetch recent movies on page load
document.addEventListener('DOMContentLoaded', fetchRecentMovies);
