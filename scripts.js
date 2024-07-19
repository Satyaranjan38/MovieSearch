
let currentPage = 1; // Initialize the current page number
let isLoading = false;
const resultsDiv = document.getElementById('results');
// Function to fetch OAuth token

let userName = localStorage.getItem('userName') ; 


console.log("user is " + userName) ; 


document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.getElementById('menu-button');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const trendingButton = document.getElementById('trending-button');
    const popularButton = document.getElementById('popular-button');
    const categoryButton = document.getElementById('category-button');
    const categoryList = document.getElementById('category-list');

    // Toggle dropdown menu on menu button click
    menuButton.addEventListener('click', () => {
        dropdownMenu.classList.toggle('show'); // Toggle the 'show' class
    });

    trendingButton.addEventListener('click', () => {
        fetchMovies('https://MovieSearch.cfapps.us10-001.hana.ondemand.com/trendingMovies');
        dropdownMenu.style.display = 'none';
    });

    popularButton.addEventListener('click', () => {
        fetchMovies('https://MovieSearch.cfapps.us10-001.hana.ondemand.com/popular');
        dropdownMenu.style.display = 'none';
    });

    // async function fetchCategories() {
    //     try {
    //         const response = await fetch('http://localhost:8086/catagory');
    //         if (!response.ok) {
    //             throw new Error(`HTTP error! Status: ${response.status}`);
    //         }
    //         const data = await response.json();
    //         displayCategories(data.categories);
    //     } catch (error) {
    //         console.error('Error fetching categories:', error);
    //     }
    // }

    // Function to display category list
    function displayCategories(categories) {
        categoryList.innerHTML = '';
        categories.forEach(category => {
            const categoryItem = document.createElement('div');
            categoryItem.textContent = category.name;
            categoryItem.className = 'category-item';
            categoryItem.addEventListener('click', async () => {
                await fetchMovies(`http://localhost:8086/fromCatagory?genreId=${category.id}`);
                dropdownMenu.style.display = 'none';
            });
            categoryList.appendChild(categoryItem);
        });
        categoryList.style.display = 'block';
    }

    // Event listeners
    menuButton.addEventListener('click', () => {
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });

    categoryButton.addEventListener('mouseover', () => {
        fetchCategories();
    });


    


    
});


async function fetchCategories() {
    try {
        const token = localStorage.getItem('oauthToken');
        const response = await fetch('https://MovieSearch.cfapps.us10-001.hana.ondemand.com/catagory', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("data from categories ", data.genres);
        displayCategories(data.genres);
        return data.genres; // Return genres array
    } catch (error) {
        console.error('Error fetching categories:', error);
        return []; // Return empty array on error
    }
}

async function displayCategories(categories) {
    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = ''; // Clear previous content
    console.log("Coming to display categories");

    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category.name;
        button.classList.add('dropdown-item');
        button.addEventListener('click', async () => {
            await fetchMoviesByCategory(category.id);
        });
        categoryList.appendChild(button);
    });
}

async function fetchMoviesByCategory(genreId) {
    try {
        const token = localStorage.getItem('oauthToken');
        const response = await fetch(`https://MovieSearch.cfapps.us10-001.hana.ondemand.com/fromCatagory?genreId=${genreId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const dropdownMenu = document.getElementById('dropdown-menu');
        dropdownMenu.style.display = 'none';
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        displayResults(data.results); // Assuming displayResults function is defined
    } catch (error) {
        console.error(`Error fetching movies for genre ID ${genreId}:`, error);
    }
}



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

async function fetchMovies(url) {
    const token = localStorage.getItem('oauthToken');
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                 'Authorization': `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        displayResults(data.results);
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}




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
    // localStorage.setItem('oauthToken', data.access_token);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const notificationButton = document.getElementById('notification-button');
const notificationArea = document.getElementById('notification-area');

// Toggle the visibility of the notification area on button click
notificationButton.addEventListener('click', () => {
    // Check if the notification area is currently visible
    if (notificationArea.style.display === 'none' || notificationArea.style.display === '') {
        // Show the notification area
        notificationArea.style.display = 'block';

    } else {
        // Hide the notification area
        notificationArea.style.display = 'none';
    }
});

// Function to initialize the app and fetch the token if not already stored
async function initializeApp() {
    const clientId = 'sb-na-3763d269-8272-4902-8ea4-21723882f1c7!t308628';
    const clientSecret = 'PoDxFeCXfWYmlfluThhpUUd6Uwo=';
    const tokenUrl = 'https://cee938d6trial.authentication.us10.hana.ondemand.com/oauth/token';
    const demoApiUrl = 'https://MovieSearch.cfapps.us10-001.hana.ondemand.com/HelloWorld/satya';
    let userName = localStorage.getItem('userName');

    if (!userName) {
        window.location.href = "https://satyaranjan38.github.io/LoginPage/";
        return; // This is now inside a function and will not cause an error
    }



    // if (!localStorage.getItem('oauthToken')) {
    //     await fetchOAuthToken(clientId, clientSecret, tokenUrl);
    //     if (!localStorage.getItem('oauthToken')) {
    //         window.location.href = "https://satyaranjan38.github.io/LoginPage/";
    //         return;
    //     }
    // }

    const isAuthorized = await checkAuthorization(demoApiUrl);

    if (!isAuthorized) {
        clearCookiesAndLocalStorage();
        await delay(3000);
        window.location.href = "https://satyaranjan38.github.io/LoginPage/";
        return;
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



async function checkAuthorization(url) {
    const token = localStorage.getItem('oauthToken');
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            return false; // Unauthorized
        }

        return true; // Authorized
    } catch (error) {
        console.error('Error checking authorization:', error);
        return false; // Assume unauthorized on error
    }
}


function clearCookiesAndLocalStorage() {
    // Clear cookies
    document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    });

    // Clear localStorage
    localStorage.clear();
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
