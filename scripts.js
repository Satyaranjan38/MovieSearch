// Function to show the loader
function showLoader() {
    const loader = document.getElementById('loader');
    loader.classList.add('active');
    loader.style.display = 'flex';
}

const API_BASE_URL = "https://railwaybackend-ludo.onrender.com";

// Function to hide the loader
function hideLoader() {
    const loader = document.getElementById('loader');
    loader.classList.remove('active');
    loader.style.display = 'none';
}

// Initialize the current page number and loading state
let currentPage = 1;
let isLoading = false;
const resultsDiv = document.getElementById('results');

// Event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.getElementById('menu-button');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const trendingButton = document.getElementById('trending-button');
    const popularButton = document.getElementById('popular-button');
    const categoryButton = document.getElementById('category-button');
    const categoryList = document.getElementById('category-list');

    // Toggle dropdown menu on menu button click
    menuButton.addEventListener('click', () => {
        dropdownMenu.classList.toggle('show');
    });

    trendingButton.addEventListener('click', () => {
        showLoader();
        fetchMovies(`${API_BASE_URL}/trendingMovies`);
        dropdownMenu.style.display = 'none';
    });

    popularButton.addEventListener('click', () => {
        showLoader();
        fetchMovies(`${API_BASE_URL}/popular`);
        dropdownMenu.style.display = 'none';
    });

    categoryButton.addEventListener('mouseover', fetchCategories);

    initializeApp(); // Call the initialization function
});

// Function to fetch categories from the server
async function fetchCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/catagory`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        displayCategories(data.genres);
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

// Function to display the categories in the dropdown
function displayCategories(categories) {
    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = '';
    categories.forEach(category => {
        const categoryItem = document.createElement('div');
        categoryItem.textContent = category.name;
        categoryItem.className = 'category-item';
        categoryItem.addEventListener('click', async () => {
            showLoader();
            await fetchMovies(`${API_BASE_URL}/fromCatagory?genreId=${category.id}`);
            dropdownMenu.style.display = 'none';
        });
        categoryList.appendChild(categoryItem);
    });
    categoryList.style.display = 'block';
}

// Function to fetch movies from the server
async function fetchMovies(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            hideLoader();
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        hideLoader();
        displayResults(data.results);
    } catch (error) {
        hideLoader();
        console.error('Error fetching movies:', error);
    }
}

// Function to fetch and display recent movies
async function fetchRecentMovies(pageNo) {
    showLoader();
    isLoading = true; // Set loading state to true before fetching data
    try {
        const response = await fetch(`${API_BASE_URL}/recentMovies?pageNo=${pageNo}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        displayResults(data.results);
        currentPage++; // Increment page number after successful fetch
    } catch (error) {
        console.error('Error fetching recent movies:', error);
    } finally {
        hideLoader();
        isLoading = false; // Reset loading state after fetching data
    }
}

// Function to display movie results on the page
function displayResults(movies) {
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

// Function to initialize the app
async function initializeApp() {
    showLoader();

    // Fetch recent movies on load
    await fetchRecentMovies(currentPage);

    // Implement infinite scroll
    window.addEventListener('scroll', async () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !isLoading) {
            await fetchRecentMovies(currentPage);
        }
    });

    hideLoader(); // Hide loader once initial data is loaded
}

// Function to handle search action
document.getElementById('search-button').addEventListener('click', async function() {
    const query = document.getElementById('search-input').value;

    showLoader();

    try {
        // Fetch search results
        const searchResponse = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
        if (!searchResponse.ok) {
            hideLoader();
            throw new Error(`HTTP error! Status: ${searchResponse.status}`);
        }
        const searchData = await searchResponse.json();
        hideLoader();
        resultsDiv.innerHTML = ''; // Clear previous results
        displayResults(searchData.results);

        // Save the search data to the database
        const userName = "i am noob";
        const saveSearchUrl = `${API_BASE_URL}/saveSearch?user=${encodeURIComponent(userName)}&name=${encodeURIComponent(query)}`;
        const saveSearchResponse = await fetch(saveSearchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!saveSearchResponse.ok) {
            throw new Error(`HTTP error! Status: ${saveSearchResponse.status}`);
        }

        const saveSearchData = await saveSearchResponse.json();
        console.log(saveSearchData.message);

    } catch (error) {
        hideLoader();
        console.error('Error:', error);
    }
});
