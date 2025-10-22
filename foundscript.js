// --- DATA ---
let foundItems = [
    { id: 101, name: 'Set of Keys', description: 'A set of three keys on a silver carabiner. One key is for a car.', category: 'keys', location: 'Rama Krishna Beach', date: '2025-10-18', imageUrl: 'https://placehold.co/600x400/1abc9c/ffffff?text=Keys' },
    { id: 102, name: 'Brown Puppy', description: 'Found a small, friendly brown puppy wandering near the INS Kursura Submarine Museum. No collar.', category: 'pets', location: 'Submarine Museum Area', date: '2025-10-17', imageUrl: 'https://placehold.co/600x400/e67e22/ffffff?text=Puppy' },
    { id: 103, name: 'Samsung Earbuds', description: 'A case with Samsung Galaxy earbuds inside was left on a bench.', category: 'electronics', location: 'Tenneti Park', date: '2025-10-18', imageUrl: 'https://placehold.co/600x400/9b59b6/ffffff?text=Earbuds' }
];
// Keep lostItems array for potential future matching features, even if not used now
let lostItems = [
    { id: 1, name: 'Car Keys', description: 'Lost my car keys, they are on a silver clip.', category: 'keys', location: 'Rama Krishna Beach', date: '2025-10-17'},
    { id: 2, name: 'Pet Dog "Ramu"', description: 'My small brown dog Ramu went missing near the beach.', category: 'pets', location: 'Submarine Museum Area', date: '2025-10-17'}
];
let lastSubmittedItem = null;

// --- DOM ELEMENTS ---
// Get elements only after DOM is loaded
let itemsGrid, noItemsMessage, reportModal, reportForm, detailModal, detailModalContent;

function initializeDOMElements() {
    itemsGrid = document.getElementById('items-grid');
    noItemsMessage = document.getElementById('no-items-message');
    reportModal = document.getElementById('report-modal');
    reportForm = document.getElementById('report-form');
    detailModal = document.getElementById('detail-modal');
    detailModalContent = document.getElementById('detail-modal-content');
}

// --- RENDER & FILTER FUNCTIONS ---
function renderItems(itemsToRender) {
    if (!itemsGrid || !noItemsMessage) return; // Ensure elements exist

    itemsGrid.innerHTML = '';
    noItemsMessage.classList.toggle('hidden', itemsToRender.length > 0);
    itemsGrid.classList.toggle('hidden', itemsToRender.length === 0);

    itemsToRender.forEach(item => {
        const card = `
            <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-200 flex flex-col cursor-pointer hover:-translate-y-2 hover:rotate-2">
                <div class="h-48 overflow-hidden"><img class="w-full h-full object-cover" src="${item.imageUrl}" alt="${item.name}" onerror="this.onerror=null;this.src='https://placehold.co/600x400/e0e0e0/757575?text=Image+Not+Found';"></div>
                <div class="p-5 flex flex-col flex-grow">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-green-100 text-green-800">Found</span>
                        <p class="text-xs text-slate-500">${new Date(item.date).toLocaleDateString()}</p>
                    </div>
                    <h3 class="text-lg font-bold text-slate-900 truncate">${item.name}</h3>
                    <p class="text-sm text-slate-600 mt-1 flex-grow">${item.description.substring(0, 80)}...</p>
                    <div class="mt-4 pt-4 border-t border-slate-200">
                        <div class="flex items-center text-sm text-slate-500">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <span class="truncate">${item.location}</span>
                        </div>
                        <button onclick="openDetailModal(${item.id})" class="mt-4 w-full bg-green-50 text-green-700 font-semibold py-2 px-4 rounded-lg hover:bg-green-100">View Details</button>
                    </div>
                </div>
            </div>`;
        itemsGrid.innerHTML += card;
    });
}

function applyFilters() {
    const searchTermInput = document.getElementById('search');
    const categoryFilterInput = document.getElementById('category-filter');
    const sortFilterInput = document.getElementById('sort-filter');
    if (!searchTermInput || !categoryFilterInput || !sortFilterInput) return; // Check if elements exist

    const searchTerm = searchTermInput.value.toLowerCase();
    const categoryFilter = categoryFilterInput.value;
    const sortFilter = sortFilterInput.value;
    
    let filtered = foundItems.filter(item =>
        (item.name.toLowerCase().includes(searchTerm) || item.description.toLowerCase().includes(searchTerm) || item.location.toLowerCase().includes(searchTerm)) &&
        (categoryFilter === 'all' || item.category === categoryFilter)
    );
    filtered.sort((a, b) => sortFilter === 'newest' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date));
    renderItems(filtered);
}

// --- MODAL HANDLING ---
function openModal() {
    if (!reportForm || !reportModal) return;
    reportForm.reset();
    document.getElementById('report-form').classList.remove('hidden');
    document.getElementById('success-view').classList.add('hidden');
    reportModal.classList.add('is-open');
     // No transform class needed as per found.html structure
}

function closeModal() {
    if (!reportModal) return;
    reportModal.classList.remove('is-open');
    // Use try-catch for elements that might not exist if modal closed prematurely
    setTimeout(() => {
        try {
            document.getElementById('report-form').classList.remove('hidden');
            document.getElementById('success-view').classList.add('hidden');
            if(reportForm) reportForm.reset();
        } catch(e) {
            console.info("Modal elements possibly removed before timeout completed.");
        }
    }, 300); // Adjust timeout if needed
}

function openDetailModal(itemId) {
    if (!detailModal || !detailModalContent) return;
    const item = foundItems.find(i => i.id === itemId);
    if (!item) return;
    // Removed the "Scan for Owner" section
    detailModalContent.innerHTML = `
        <div class="flex items-start justify-between mb-4"><h3 class="text-2xl font-bold text-slate-900">${item.name}</h3><button onclick="closeDetailModal()" class="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div>
        <img src="${item.imageUrl}" alt="${item.name}" class="w-full h-64 object-cover rounded-lg mb-4" onerror="this.onerror=null;this.src='https://placehold.co/600x400/e0e0e0/757575?text=Image+Not+Found';">
        <div class="space-y-3 text-slate-700"><p><strong class="font-semibold text-slate-800">Status:</strong> <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-green-100 text-green-800">Found</span></p><p><strong class="font-semibold text-slate-800">Description:</strong> ${item.description}</p><p><strong class="font-semibold text-slate-800">Location Found:</strong> ${item.location}</p><p><strong class="font-semibold text-slate-800">Date Found:</strong> ${new Date(item.date).toLocaleDateString()}</p></div>
        <div class="mt-6 pt-4 border-t">
             <button class="w-full bg-green-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-green-700">Claim Item</button> 
             <!-- Placeholder for claim functionality -->
        </div>`;
    detailModal.classList.add('is-open');
}

function closeDetailModal() {
     if (detailModal) detailModal.classList.remove('is-open');
}

// --- GEMINI API FEATURES ---
const apiKey = ""; // Per instructions, leave empty.
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

async function callGeminiAPI(prompt, button) {
    // Ensure button exists before proceeding
    if (!button) {
        console.error("Button element not found for API call.");
        return "Error: Button not found.";
    }
    const originalContent = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<div class="spinner mx-auto"></div>';
    
    try {
        const payload = { contents: [{ parts: [{ text: prompt }] }] };
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`API call failed: ${response.status}`);
        const result = await response.json();
        return result.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
    } catch (error) {
        console.error("Gemini API call error:", error);
        return "An error occurred. Please try again.";
    } finally {
        // Check if button still exists before trying to modify it
        if (document.body.contains(button)) {
             button.disabled = false;
             button.innerHTML = originalContent;
        }
    }
}

async function enhanceDescription() {
    const itemNameInput = document.getElementById('item-name');
    const descriptionInput = document.getElementById('item-description');
    const enhanceButton = document.getElementById('enhance-description-btn');
    if (!itemNameInput || !descriptionInput || !enhanceButton) return; // Ensure elements exist

    const itemName = itemNameInput.value;
    const currentDescription = descriptionInput.value;
    if (!itemName) { alert("Please enter an item name first."); return; }
    
    // Prompt adapted for "found" items
    const prompt = `A user has found an item. Item Name: "${itemName}". Current description: "${currentDescription}". Enhance this description to help the owner identify it, without giving away too much private information. Suggest asking the potential owner for a unique detail to verify ownership. Keep it concise, under 70 words.`;
    const enhancedText = await callGeminiAPI(prompt, enhanceButton);
    descriptionInput.value = enhancedText;
}

function copySocialPost() {
    const textArea = document.getElementById('social-post-output');
    if (!textArea) { console.error("Social post textarea not found."); return; }
    if (!textArea.value) { alert("Nothing to copy! Please generate a post first."); return; }
    textArea.select();
    try { 
        document.execCommand('copy'); 
        alert("Copied to clipboard!"); 
    } catch (err) { 
        console.error("Could not copy text: ", err);
        alert("Could not copy text."); 
    }
}

// suggestNextSteps function specific to Found items
async function suggestNextSteps() {
    const button = document.getElementById('suggest-steps-btn');
    const resultsContainer = document.getElementById('steps-output');
    if(!button || !resultsContainer) return; // Exit if elements don't exist yet

    resultsContainer.innerHTML = ''; // Clear previous results

    if (!lastSubmittedItem) return;

    const prompt = `A user in Visakhapatnam, India has just reported finding an item. Based on the details, provide a short, actionable list of 3-4 responsible next steps they should take. Format the response as an HTML unordered list (<ul><li>...</li></ul>). Found Item Name: "${lastSubmittedItem.name}". Found Location: "${lastSubmittedItem.location}".`;
    
    const suggestionsHtml = await callGeminiAPI(prompt, button);
    resultsContainer.innerHTML = suggestionsHtml;
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    if (!reportForm) return; // Ensure form exists

    reportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newItem = {
            id: Date.now(),
            name: document.getElementById('item-name').value,
            description: document.getElementById('item-description').value,
            category: document.getElementById('item-category').value,
            location: document.getElementById('item-location').value,
            date: document.getElementById('item-date').value,
            imageUrl: `https://placehold.co/600x400/2ecc71/ffffff?text=${encodeURIComponent(document.getElementById('item-name').value)}` // Green placeholder
        };
        lastSubmittedItem = newItem;
        foundItems.unshift(newItem); // Add to the beginning of foundItems array
        applyFilters();
        
        document.getElementById('report-form').classList.add('hidden');
        document.getElementById('success-view').classList.remove('hidden');
        
        // Ensure elements exist before trying to access/modify them
        const socialOutput = document.getElementById('social-post-output');
        if (socialOutput) socialOutput.value = '';
        const stepsOutput = document.getElementById('steps-output');
        if (stepsOutput) stepsOutput.innerHTML = '';


        const generateBtn = document.getElementById('generate-post-btn');
        if (generateBtn) {
            generateBtn.onclick = async () => {
                if (!lastSubmittedItem) return; // Check if lastSubmittedItem exists
                // Prompt adapted for "found" items
                const prompt = `Create a brief, friendly, and effective social media post about a found item, to help find the owner. Item: "${lastSubmittedItem.name}". Description: "${lastSubmittedItem.description}". Found at: "${lastSubmittedItem.location}". The post should be under 280 characters and should not include personal contact info. It should prompt the owner to describe a unique detail to claim it. Include hashtags like #FoundItem, #${lastSubmittedItem.location.split(' ').join('')}, #Visakhapatnam.`;
                const postText = await callGeminiAPI(prompt, generateBtn);
                if (socialOutput) socialOutput.value = postText;
            };
        }
        
        const suggestBtn = document.getElementById('suggest-steps-btn');
        if(suggestBtn) {
            // Assign the correct function
            suggestBtn.onclick = suggestNextSteps; 
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeDetailModal();
        }
    });

    // Add event listeners for modals only if they exist
    if (reportModal) {
        reportModal.addEventListener('click', (e) => {
            if (e.target === reportModal) closeModal();
        });
    }
    if (detailModal) {
         detailModal.addEventListener('click', (e) => {
             if (e.target === detailModal) closeDetailModal();
         });
    }
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initializeDOMElements(); // Get DOM elements now that they exist
    applyFilters();          // Initial render
    
    const reportButton = document.getElementById('report-found-item-btn'); // Correct button ID for found page
    if (reportButton) {
        reportButton.addEventListener('click', openModal);
    }
    
    setupEventListeners(); // Setup form submit and other listeners
});

