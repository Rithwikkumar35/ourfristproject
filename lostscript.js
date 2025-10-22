// --- DATA ---
let items = [
    { id: 1, status: 'lost', name: 'OnePlus Phone', description: 'Lost my blue OnePlus phone in a black case. Has a small crack on the top left corner. Lock screen is a picture of a temple.', category: 'electronics', location: 'Visakhapatnam Railway Station', date: '2025-10-17', imageUrl: 'https://placehold.co/600x400/3498db/ffffff?text=Phone' },
    { id: 3, status: 'lost', name: 'Black Leather Wallet', description: 'Men\'s black leather wallet. Contains an Aadhar card and several bank cards. Lost somewhere on a local city bus.', category: 'wallets', location: 'City Bus Route 25K', date: '2025-10-15', imageUrl: 'https://placehold.co/600x400/34495e/ffffff?text=Wallet' },
    { id: 5, status: 'lost', name: 'Boat Airdopes Case', description: 'Lost just the charging case for my Boat Airdopes. It has a slight scratch on the front. Probably fell out of my pocket.', category: 'electronics', location: 'Araku Coffee House', date: '2025-10-14', imageUrl: 'https://placehold.co/600x400/9b59b6/ffffff?text=Earbuds+Case' }
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
                        <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-red-100 text-red-800">Lost</span>
                        <p class="text-xs text-slate-500">${new Date(item.date).toLocaleDateString()}</p>
                    </div>
                    <h3 class="text-lg font-bold text-slate-900 truncate">${item.name}</h3>
                    <p class="text-sm text-slate-600 mt-1 flex-grow">${item.description.substring(0, 80)}${item.description.length > 80 ? '...' : ''}</p>
                    <div class="mt-4 pt-4 border-t border-slate-200">
                        <div class="flex items-center text-sm text-slate-500">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <span class="truncate">${item.location}</span>
                        </div>
                    </div>
                     <button onclick="openDetailModal(${item.id})" class="mt-4 w-full bg-indigo-50 text-indigo-700 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-100">View Details & Contact</button>
                </div>
            </div>`;
        itemsGrid.innerHTML += card;
    });
}

function applyFilters() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    const sortFilter = document.getElementById('sort-filter').value;
    let filteredItems = items.filter(item => 
        (item.name.toLowerCase().includes(searchTerm) || item.description.toLowerCase().includes(searchTerm) || item.location.toLowerCase().includes(searchTerm)) &&
        (categoryFilter === 'all' || item.category === categoryFilter)
    );
    filteredItems.sort((a, b) => sortFilter === 'newest' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date));
    renderItems(filteredItems);
}

// --- MODAL HANDLING ---
function openModal() {
    if (!reportForm || !reportModal) return;
    reportForm.reset();
    document.getElementById('report-form').classList.remove('hidden');
    document.getElementById('success-view').classList.add('hidden');
    reportModal.classList.add('is-open');
    reportModal.querySelector('.transform').classList.remove('scale-95');
}

function closeModal() {
    if (!reportModal) return;
    const modalTransform = reportModal.querySelector('.transform');
    if (modalTransform) {
        modalTransform.classList.add('scale-95');
    }
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
    }, 300);
}

function openDetailModal(itemId) {
    if (!detailModal || !detailModalContent) return;
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    detailModalContent.innerHTML = `
        <div class="flex items-start justify-between mb-4"><h3 class="text-2xl font-bold text-slate-900">${item.name}</h3><button onclick="closeDetailModal()" class="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div>
        <img src="${item.imageUrl}" alt="${item.name}" class="w-full h-64 object-cover rounded-lg mb-4" onerror="this.onerror=null;this.src='https://placehold.co/600x400/e0e0e0/757575?text=Image+Not+Found';">
        <div class="space-y-3 text-slate-700"><p><strong class="font-semibold text-slate-800">Status:</strong> <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-red-100 text-red-800">Lost</span></p><p><strong class="font-semibold text-slate-800">Description:</strong> ${item.description}</p><p><strong class="font-semibold text-slate-800">Last Seen:</strong> ${item.location}</p><p><strong class="font-semibold text-slate-800">Date Lost:</strong> ${new Date(item.date).toLocaleDateString()}</p></div>
        <div class="mt-6 pt-4 border-t">
            <button class="w-full bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-indigo-700">Contact Poster</button>
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
    
    const prompt = `A user has lost an item. Item Name: "${itemName}". Current description: "${currentDescription}". Enhance this description for a lost and found website. Make it clearer and more detailed, but do not invent new physical features. Suggest what details a finder should look for to verify ownership. Keep it concise, under 70 words.`;
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

// --- EVENT LISTENERS ---
function setupEventListeners() {
    if (!reportForm) return; // Ensure form exists

    reportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newItem = {
            id: Date.now(), status: 'lost',
            name: document.getElementById('item-name').value, 
            description: document.getElementById('item-description').value,
            category: document.getElementById('item-category').value, 
            location: document.getElementById('item-location').value,
            date: document.getElementById('item-date').value,
            imageUrl: `https://placehold.co/600x400/7f8c8d/ffffff?text=${encodeURIComponent(document.getElementById('item-name').value)}`
        };
        lastSubmittedItem = newItem;
        items.unshift(newItem); // Add new item to the start
        applyFilters();
        
        document.getElementById('report-form').classList.add('hidden');
        document.getElementById('success-view').classList.remove('hidden');
        
        // Ensure elements exist before trying to access/modify them
        const socialOutput = document.getElementById('social-post-output');
        if (socialOutput) socialOutput.value = '';

        const generateBtn = document.getElementById('generate-post-btn');
        if (generateBtn) {
            generateBtn.onclick = async () => {
                if (!lastSubmittedItem) return; // Check if lastSubmittedItem exists
                const prompt = `Create a brief, friendly, and effective social media post about a lost item. Item: "${lastSubmittedItem.name}". Description: "${lastSubmittedItem.description}". Last seen at: "${lastSubmittedItem.location}". The post should be under 280 characters. Do not include any contact information. Direct people to the website where the item was reported. Include hashtags like #LostItem, #${lastSubmittedItem.location.split(' ').join('')}, #Visakhapatnam.`;
                const postText = await callGeminiAPI(prompt, generateBtn);
                if (socialOutput) socialOutput.value = postText;
            };
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
    
    const reportButton = document.getElementById('report-item-btn');
    if (reportButton) {
        reportButton.addEventListener('click', openModal);
    }
    
    setupEventListeners(); // Setup form submit and other listeners
});
