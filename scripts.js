
let currentPage = 1; // Initialize the current page number
let isLoading = false;
const resultsDiv = document.getElementById('results');
// Function to fetch OAuth token

let userName = localStorage.getItem('userName') ; 



console.log("user is " + userName) ; 


// Fetch and display previous searches
document.getElementById('search-input').addEventListener('focus', async function() {
    const user = localStorage.getItem('userName');
    const previousSearchesDropdown = document.getElementById('previous-searches');

    try {
        const response = await fetch(`https://MovieSearch.cfapps.us10-001.hana.ondemand.com/getSearch?user=${encodeURIComponent(user)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const uniqueSearches = [...new Set(data.previousSearch)];

        previousSearchesDropdown.innerHTML = '';

        uniqueSearches.forEach(search => {
            const option = document.createElement('option');
            option.value = search;
            previousSearchesDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching previous searches:', error);
    }
});



function displayPreviousSearches(searches) {
    const previousSearchesDiv = document.getElementById('previous-searches');
    previousSearchesDiv.innerHTML = ''; // Clear previous suggestions
    searches.forEach(search => {
        const searchItem = document.createElement('p');
        searchItem.textContent = search;
        searchItem.addEventListener('click', () => {
            document.getElementById('search-input').value = search;
            previousSearchesDiv.style.display = 'none'; // Hide suggestions after selection
        });
        previousSearchesDiv.appendChild(searchItem);
    });
    previousSearchesDiv.style.display = 'block'; // Show the suggestions
}

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
    localStorage.setItem('oauthToken', data.access_token);
}

// Function to initialize the app and fetch the token if not already stored
async function initializeApp() {
    const clientId = 'sb-na-20e3ce3b-94a8-412b-ae95-e3e44623bf39!t292265';
    const clientSecret = 'yKZJl9AELfxltYhL+PcgK2lVGBw=';
    const tokenUrl = 'https://10db0aa4trial.authentication.us10.hana.ondemand.com/oauth/token';


    if (!userName) {
        window.location.href = "https://satyaranjan38.github.io/LoginPage/";
        return; // This is now inside a function and will not cause an error
    }

    if (!localStorage.getItem('oauthToken')) {
        await fetchOAuthToken(clientId, clientSecret, tokenUrl);
    }

    // Fetch recent movies on page load
    await fetchRecentMovies(currentPage);

    window.addEventListener('scroll', async () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight && !isLoading) {
            // Fetch next page when user scrolls to the bottom
            currentPage++;
            isLoading = true; // Set loading flag to prevent multiple fetches
            await fetchRecentMovies(currentPage);
            isLoading = false; // Reset loading flag after fetch completes
        }
    });

}

// Function to handle API request with OAuth token
document.getElementById('search-button').addEventListener('click', async function() {
    const query = document.getElementById('search-input').value;
    const token = localStorage.getItem('oauthToken');
    const userName = localStorage.getItem('userName');
    
    console.log("user is " + userName);

    try {
        // Fetch search results
        const searchResponse = await fetch(`https://MovieSearch.cfapps.us10-001.hana.ondemand.com/search?query=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!searchResponse.ok) {
            throw new Error(`HTTP error! Status: ${searchResponse.status}`);
        }

        const searchData = await searchResponse.json();
        displayResults(searchData.results);

        // Save the search data to the database
        const saveSearchUrl = `https://MovieSearch.cfapps.us10-001.hana.ondemand.com/saveSearch?user=${encodeURIComponent(userName)}&name=${encodeURIComponent(query)}`;
        const saveSearchResponse = await fetch(saveSearchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!saveSearchResponse.ok) {
            throw new Error(`HTTP error! Status: ${saveSearchResponse.status}`);
        }

        const saveSearchData = await saveSearchResponse.json();
        console.log(saveSearchData.message);

    } catch (error) {
        console.error('Error:', error);
    }
});


// Function to display search results
function displayResults(movies, elementId = 'results') {
    const resultsDiv = document.getElementById(elementId);
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




// Function to fetch recent movies
async function fetchRecentMovies(pageNo) {
    const token = localStorage.getItem('oauthToken');

    try {
        const response = await fetch(`https://MovieSearch.cfapps.us10-001.hana.ondemand.com/recentMovies?pageNo=${pageNo}`, {
            headers: {
                'Content-Type': 'application/json',
                 'Authorization': `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        displayResultsrecent(data.results); // Display results for the current page
        currentPage++; // Increment the current page number for next fetch
    } catch (error) {
        console.error('Error fetching recent movies:', error);
    }
}


function displayResultsrecent(movies) {
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

        resultsDiv.appendChild(movieCard); // Append movie card to results container
    });
}




// Initialize the app
document.addEventListener('DOMContentLoaded', initializeApp);
