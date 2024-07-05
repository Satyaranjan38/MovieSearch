document.getElementById('search-button').addEventListener('click', function() {
    const query = document.getElementById('search-input').value;
    fetch(`https://MovieSearch.cfapps.us10-001.hana.ondemand.com/search?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => displayResults(data.results))
        .catch(error => console.error('Error:', error));
});

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
