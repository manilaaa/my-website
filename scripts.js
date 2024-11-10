// Initialize fake "database" in localStorage if not present
if (!localStorage.getItem('users')) {
  localStorage.setItem('users', JSON.stringify([{ username: 'testuser', password: 'testpass' }]));
}

// Login Form Handler
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    // Retrieve users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find((user) => user.username === username && user.password === password);

    if (user) {
      // Login successful
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      window.location.href = 'home.html';  // Redirect to home page
    } else {
      // Login failed
      alert('Invalid username or password');
    }
  });
}

// Sign-Up Form Handler
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;

    // Retrieve users from localStorage and add the new user
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const existingUser = users.find((user) => user.username === username);

    if (existingUser) {
      alert('Username already exists. Please choose another one.');
    } else {
      users.push({ username, password });
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('loggedInUser', JSON.stringify({ username }));
      window.location.href = 'home.html';  // Redirect to home page after sign-up
    }
  });
}

// Log Out Button Handler
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'home.html';  // Redirect to home page after logging out
  });
}

// Update Auth Buttons and Welcome Message on Home Page
function updateAuthButtons() {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const welcomeMessage = document.getElementById('welcome-message');

  if (loggedInUser) {
    // User is logged in
    loginBtn.style.display = 'none';
    signupBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    welcomeMessage.style.display = 'block';
    welcomeMessage.textContent = `Welcome, ${loggedInUser.username}!`;
  } else {
    // User is logged out
    loginBtn.style.display = 'inline-block';
    signupBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    if (welcomeMessage) welcomeMessage.style.display = 'none';
  }
}

// Run updateAuthButtons on page load
window.onload = updateAuthButtons;
const eventForm = document.getElementById('event-form');
const calendarDays = document.querySelectorAll('#calendar .day');
const events = JSON.parse(localStorage.getItem('events')) || {};

// Render events and highlight on the calendar
function renderCalendarEvents() {
    calendarDays.forEach(day => {
        const dayNumber = day.textContent;
        const dateStr = `2024-11-${String(dayNumber).padStart(2, '0')}`;
        if (events[dateStr]) {
            day.classList.add('event-day');
            day.title = `Event: ${events[dateStr].name} at ${events[dateStr].time}`;
        } else {
            day.classList.remove('event-day');
            day.removeAttribute('title');
        }
    });
}

// Add event to calendar
eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const eventName = document.getElementById('event-name').value;
    const eventDate = document.getElementById('event-date').value;
    const eventTime = document.getElementById('event-time').value;

    if (eventDate && eventName && eventTime) {
        events[eventDate] = { name: eventName, time: eventTime };
        localStorage.setItem('events', JSON.stringify(events));
        renderCalendarEvents();
        alert(`Event "${eventName}" added on ${eventDate} at ${eventTime}`);
        eventForm.reset();
    }
});

// Notify if an event is due (runs every minute)
function checkForUpcomingEvents() {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);

    if (events[todayStr] && events[todayStr].time === currentTime) {
        alert(`Reminder: You have an event - "${events[todayStr].name}" now!`);
    }
}

// Initialize calendar and start notification check
document.addEventListener('DOMContentLoaded', () => {
    renderCalendarEvents();
    setInterval(checkForUpcomingEvents, 60000); // Check every minute
});
// Function to load ratings from localStorage
function loadRatings() {
  const ratings = JSON.parse(localStorage.getItem('gameRatings')) || {};
  for (let gameId in ratings) {
      displayAverageRating(gameId, calculateAverage(ratings[gameId]));
  }
}

// Function to handle rating selection
function rateGame(gameId, rating) {
  const ratings = JSON.parse(localStorage.getItem('gameRatings')) || {};
  if (!ratings[gameId]) {
      ratings[gameId] = [];
  }
  ratings[gameId].push(parseInt(rating)); // Add the new rating
  localStorage.setItem('gameRatings', JSON.stringify(ratings)); // Save to localStorage

  const averageRating = calculateAverage(ratings[gameId]);
  displayAverageRating(gameId, averageRating);
}

// Calculate the average rating for a game
function calculateAverage(ratings) {
  const total = ratings.reduce((acc, rating) => acc + rating, 0);
  return (total / ratings.length).toFixed(1); // One decimal for clarity
}

// Display the average rating on the page
function displayAverageRating(gameId, averageRating) {
  const ratingResult = document.getElementById(`rating-result-${gameId}`);
  if (ratingResult) {
      ratingResult.textContent = `Average Rating: ${averageRating} stars`;
  }
}

// Initialize ratings on page load
document.addEventListener('DOMContentLoaded', loadRatings);
// Function to toggle game favorite status
function favoriteGame(gameId) {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

  if (!loggedInUser) {
      alert('Please log in to save your favorites.');
      return;
  }

  const favorites = JSON.parse(localStorage.getItem('favorites')) || {};
  const userFavorites = favorites[loggedInUser.username] || [];

  if (userFavorites.includes(gameId)) {
      userFavorites.splice(userFavorites.indexOf(gameId), 1); // Remove from favorites
      alert(`${gameId} removed from favorites.`);
  } else {
      userFavorites.push(gameId); // Add to favorites
      alert(`${gameId} added to favorites!`);
  }

  favorites[loggedInUser.username] = userFavorites;
  localStorage.setItem('favorites', JSON.stringify(favorites));
  updateFavoriteButton(gameId, userFavorites.includes(gameId));
}

// Function to update favorite button appearance based on status
function updateFavoriteButton(gameId, isFavorited) {
  const button = document.querySelector(`.game-box#${gameId} .favorite-btn`);
  if (button) {
      button.textContent = isFavorited ? '★ Favorited' : '♡ Favorite';
  }
}

// Function to load favorite games on page load to show correct button state
function loadFavorites() {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!loggedInUser) return;

  const favorites = JSON.parse(localStorage.getItem('favorites')) || {};
  const userFavorites = favorites[loggedInUser.username] || [];

  userFavorites.forEach((gameId) => {
      updateFavoriteButton(gameId, true);
  });
}

// Function to display favorite games on the home page
function displayFavoritesOnHomePage() {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!loggedInUser) return;

  const favorites = JSON.parse(localStorage.getItem('favorites')) || {};
  const userFavorites = favorites[loggedInUser.username] || [];

  const favoritesContainer = document.getElementById('favorite-games-list');
  favoritesContainer.innerHTML = ''; // Clear existing content

  if (userFavorites.length === 0) {
      favoritesContainer.innerHTML = '<p>No favorites added yet.</p>';
      return;
  }

  userFavorites.forEach((gameId) => {
      const gameBox = document.getElementById(gameId).cloneNode(true);
      gameBox.querySelector('.favorite-btn').remove(); // Remove favorite button on home page
      favoritesContainer.appendChild(gameBox);
  });
}

// Initial load setup for favorites and home page
document.addEventListener('DOMContentLoaded', () => {
  loadFavorites(); // Load favorites on games page
  const homeFavoritesSection = document.getElementById('home-favorites');
  if (homeFavoritesSection) {
      displayFavoritesOnHomePage(); // Display favorites on the home page if user is logged in
      homeFavoritesSection.style.display = 'block';
  }
});
document.addEventListener('DOMContentLoaded', () => {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const homeFavoritesSection = document.getElementById('home-favorites');

  if (loggedInUser && homeFavoritesSection) {
      homeFavoritesSection.style.display = 'block';
      displayFavoritesOnHomePage();
  }
});

// Function to display favorite games on the home page
function displayFavoritesOnHomePage() {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!loggedInUser) return;

  const favorites = JSON.parse(localStorage.getItem('favorites')) || {};
  const userFavorites = favorites[loggedInUser.username] || [];

  const favoritesContainer = document.getElementById('favorite-games-list');
  favoritesContainer.innerHTML = ''; // Clear existing content

  if (userFavorites.length === 0) {
      favoritesContainer.innerHTML = '<p>No favorites added yet.</p>';
      return;
  }

  userFavorites.forEach((gameId) => {
      const gameBox = document.getElementById(gameId);
      if (gameBox) {
          const gameClone = gameBox.cloneNode(true);
          gameClone.querySelector('.favorite-btn').remove(); // Remove favorite button
          favoritesContainer.appendChild(gameClone);
      }
  });
}
document.addEventListener('DOMContentLoaded', () => {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

  if (!loggedInUser) return; // Exit if user is not logged in

  const favoritesContainer = document.getElementById('home-favorites');
  const favorites = JSON.parse(localStorage.getItem('favorites')) || {};
  const userFavorites = favorites[loggedInUser.username] || [];

  if (userFavorites.length === 0) {
    favoritesContainer.style.display = 'none'; // Hide if no favorites
  } else {
    favoritesContainer.style.display = 'block'; // Show favorite games section if there are favorites

    // Loop through each favorite game ID and make its game box visible
    userFavorites.forEach((gameId) => {
      const gameBox = document.getElementById(gameId);
      if (gameBox) {
        gameBox.style.display = 'block'; // Make the game box visible
      }
    });
  }
});
