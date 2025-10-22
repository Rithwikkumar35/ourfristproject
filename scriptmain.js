// Navigate to page
function goToPage(page) {
    window.location.href = page;
}

// Display number of lost items in quick stats
function updateStats() {
    const lostItems = JSON.parse(localStorage.getItem('lostItems')) || [];
    document.getElementById('lostItemsCount').textContent = `Total Lost Items Reported: ${lostItems.length}`;
}

// Personalized welcome message (optional)
const userName = localStorage.getItem('userName');
if(userName) {
    document.getElementById('welcomeMessage').textContent = `Welcome back, ${userName}!`;
}

// Update stats on load
updateStats();
