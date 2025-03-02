const locationInput = document.getElementById('location-input');
const searchBtn = document.getElementById('search-btn');
const geoBtn = document.getElementById('geo-btn');
const weatherInfo = document.getElementById('weather-info');
const locationDisplay = document.getElementById('location');
const temperatureDisplay = document.getElementById('temperature');
const conditionDisplay = document.getElementById('condition');
const humidityDisplay = document.getElementById('humidity');
const windDisplay = document.getElementById('wind');
const pressureDisplay = document.getElementById('pressure');
const weatherIcon = document.getElementById('weather-icon');
const lastUpdatedDisplay = document.getElementById('last-updated');
const cityList = document.getElementById('city-list');
const loading = document.getElementById('loading');

// OpenWeatherMap API Key (Replace with your own API key)
const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // Sign up at openweathermap.org for a free API key

// Array of predefined Indian cities
const cities = [
    "Mumbai,IN",
    "Delhi,IN",
    "Bangalore,IN",
    "Kolkata,IN",
    "Chennai,IN",
    "Hyderabad,IN",
    "Pune,IN",
    "Ahmedabad,IN",
    "Jaipur,IN",
    "Lucknow,IN"
];

// Populate datalist with cities for autocomplete
cities.forEach(city => {
    const option = document.createElement('option');
    // Display only the city name in the dropdown (remove ",IN")
    option.value = city.split(',')[0];
    cityList.appendChild(option);
});

// Show loading state
function showLoading() {
    loading.classList.add('active');
    searchBtn.disabled = true;
    geoBtn.disabled = true;
    weatherInfo.classList.remove('active');
}

// Hide loading state
function hideLoading() {
    loading.classList.remove('active');
    searchBtn.disabled = false;
    geoBtn.disabled = false;
}

// Fetch weather data by city name
async function fetchWeatherByCity(city) {
    try {
        showLoading();
        // Normalize the city input to match the array format (e.g., "Mumbai" -> "Mumbai,IN")
        const normalizedCity = city.endsWith(',IN') ? city : `${city},IN`;
        // Validate city against the array
        if (!cities.includes(normalizedCity)) {
            throw new Error(`City "${city}" not found in the list. Please select an Indian city from the dropdown (e.g., Mumbai, Delhi).`);
        }
        // Check if API key is valid
        if (API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY') {
            throw new Error('Invalid API key. Please replace "YOUR_OPENWEATHERMAP_API_KEY" with a valid OpenWeatherMap API key.');
        }
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${normalizedCity}&appid=${API_KEY}&units=metric`);
        if (!response.ok) {
            throw new Error('Unable to fetch weather data. Please check your internet connection or try again later.');
        }
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        alert(error.message);
        weatherInfo.classList.remove('active');
    } finally {
        hideLoading();
    }
}

// Fetch weather data by geolocation
async function fetchWeatherByGeo(lat, lon) {
    try {
        showLoading();
        if (API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY') {
            throw new Error('Invalid API key. Please replace "YOUR_OPENWEATHERMAP_API_KEY" with a valid OpenWeatherMap API key.');
        }
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        if (!response.ok) {
            throw new Error('Unable to fetch weather data for your location. Please try searching for a city manually.');
        }
        const data = await response.json();
        // Check if the city from geolocation is in the predefined list
        const cityCountry = `${data.name},IN`;
        if (!cities.includes(cityCountry)) {
            throw new Error(`Your location (${data.name}) is not in the supported Indian city list. Please search for a city manually (e.g., Mumbai, Delhi).`);
        }
        displayWeather(data);
    } catch (error) {
        alert(error.message);
        weatherInfo.classList.remove('active');
    } finally {
        hideLoading();
    }
}

// Display weather information
function displayWeather(data) {
    const cityName = data.name;
    const temp = Math.round(data.main.temp);
    const condition = data.weather[0].description;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const pressure = data.main.pressure;
    const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    const timestamp = new Date(data.dt * 1000).toLocaleString();

    locationDisplay.textContent = `${cityName}, ${data.sys.country}`;
    temperatureDisplay.textContent = `${temp}°C`;
    conditionDisplay.textContent = condition;
    humidityDisplay.textContent = `Humidity: ${humidity}%`;
    windDisplay.textContent = `Wind: ${windSpeed} m/s`;
    pressureDisplay.textContent = `Pressure: ${pressure} hPa`;
    weatherIcon.src = icon;
    lastUpdatedDisplay.textContent = `Last Updated: ${timestamp}`;

    weatherInfo.classList.add('active');
}

// Handle search button click
searchBtn.addEventListener('click', () => {
    const city = locationInput.value.trim();
    if (!city) {
        alert('Please enter a city name.');
        return;
    }
    fetchWeatherByCity(city);
});

// Handle Enter key press in input field
locationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = locationInput.value.trim();
        if (!city) {
            alert('Please enter a city name.');
            return;
        }
        fetchWeatherByCity(city);
    }
});

// Handle geolocation button click
geoBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByGeo(latitude, longitude);
            },
            (error) => {
                let errorMessage = 'Unable to retrieve your location.';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied. Please allow location access and try again.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'The request to get your location timed out.';
                        break;
                }
                alert(errorMessage);
            }
        );
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

// Initial setup
weatherInfo.classList.remove('active');
hideLoading();