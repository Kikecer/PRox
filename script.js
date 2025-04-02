// DOM Elements
const authContainer = document.getElementById('authContainer');
const appContainer = document.getElementById('appContainer');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const loginButton = document.getElementById('loginButton');
const registerButton = document.getElementById('registerButton');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const registerName = document.getElementById('registerName');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');
const registerConfirmPassword = document.getElementById('registerConfirmPassword');
const userName = document.getElementById('userName');
const userAvatar = document.getElementById('userAvatar');
const logoutButton = document.getElementById('logoutButton');
const themeToggle = document.getElementById('themeToggle');
const allCardsBtn = document.getElementById('allCardsBtn');
const favoritesBtn = document.getElementById('favoritesBtn');
const tagsList = document.getElementById('tagsList');
const addTagBtn = document.getElementById('addTagBtn');
const boardTitle = document.getElementById('boardTitle');
const board = document.getElementById('board');
const addCardButton = document.getElementById('addCardButton');
const cardModal = document.getElementById('cardModal');
const closeCardModal = document.getElementById('closeCardModal');
const cancelCard = document.getElementById('cancelCard');
const modalTitle = document.getElementById('modalTitle');
const cardTitle = document.getElementById('cardTitle');
const cardText = document.getElementById('cardText');
const cardTags = document.getElementById('cardTags');
const cardColor = document.getElementById('cardColor');
const saveCard = document.getElementById('saveCard');
const tagModal = document.getElementById('tagModal');
const closeTagModal = document.getElementById('closeTagModal');
const tagName = document.getElementById('tagName');
const tagColor = document.getElementById('tagColor');
const saveTag = document.getElementById('saveTag');
const cancelTag = document.getElementById('cancelTag');
const confirmModal = document.getElementById('confirmModal');
const confirmMessage = document.getElementById('confirmMessage');
const cancelConfirm = document.getElementById('cancelConfirm');
const confirmAction = document.getElementById('confirmAction');

// State
let currentUser = null;
let cards = [];
let tags = [];
let currentView = 'all';
let currentTagFilter = null;
let editCardId = null;
let deleteTagId = null;

// Initialize the app
function init() {
    loadUsers();
    loadTags();
    checkAuth();
    setupEventListeners();
}

// Check authentication status
function checkAuth() {
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
        currentUser = JSON.parse(loggedInUser);
        showApp();
    } else {
        showAuth();
    }
}

// Show authentication forms
function showAuth() {
    authContainer.style.display = 'flex';
    appContainer.style.display = 'none';
}

// Show main application
function showApp() {
    authContainer.style.display = 'none';
    appContainer.style.display = 'grid';
    
    // Update UI with user info
    userName.textContent = currentUser.name;
    userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`;
    
    // Load user's cards
    loadCards();
    renderTags();
    applyTheme();
}

// Setup event listeners
function setupEventListeners() {
    // Auth events
    showRegister.addEventListener('click', () => {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });
    
    showLogin.addEventListener('click', () => {
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    });
    
    loginButton.addEventListener('click', handleLogin);
    registerButton.addEventListener('click', handleRegister);
    logoutButton.addEventListener('click', handleLogout);
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Navigation
    allCardsBtn.addEventListener('click', () => switchView('all'));
    favoritesBtn.addEventListener('click', () => switchView('favorites'));
    
    // Card modal
    addCardButton.addEventListener('click', () => openCardModal());
    closeCardModal.addEventListener('click', closeModal);
    cancelCard.addEventListener('click', closeModal);
    saveCard.addEventListener('click', saveCardHandler);
    
    // Tag modal
    addTagBtn.addEventListener('click', () => openTagModal());
    closeTagModal.addEventListener('click', closeModal);
    cancelTag.addEventListener('click', closeModal);
    saveTag.addEventListener('click', saveTagHandler);
    
    // Confirm modal
    cancelConfirm.addEventListener('click', closeModal);
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();
    
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showApp();
    } else {
        alert('Invalid email or password');
    }
}

// Handle registration
function handleRegister(e) {
    e.preventDefault();
    
    const name = registerName.value.trim();
    const email = registerEmail.value.trim();
    const password = registerPassword.value.trim();
    const confirmPassword = registerConfirmPassword.value.trim();
    
    if (!name || !email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.some(u => u.email === email)) {
        alert('Email already registered');
        return;
    }
    
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        theme: 'light'
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showApp();
}

// Handle logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showAuth();
    resetAuthForms();
}

// Reset auth forms
function resetAuthForms() {
    loginEmail.value = '';
    loginPassword.value = '';
    registerName.value = '';
    registerEmail.value = '';
    registerPassword.value = '';
    registerConfirmPassword.value = '';
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
}

// Toggle theme
function toggleTheme() {
    const icon = themeToggle.querySelector('i');
    if (currentUser.theme === 'light') {
        currentUser.theme = 'dark';
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        currentUser.theme = 'light';
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
    
    // Update user in storage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    applyTheme();
}

// Apply theme
function applyTheme() {
    document.documentElement.setAttribute('data-theme', currentUser.theme);
    const icon = themeToggle.querySelector('i');
    if (currentUser.theme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// Switch view
function switchView(view) {
    currentView = view;
    currentTagFilter = null;
    
    // Update active button
    allCardsBtn.classList.toggle('active', view === 'all');
    favoritesBtn.classList.toggle('active', view === 'favorites');
    
    // Update board title
    boardTitle.textContent = view === 'all' ? 'All Inspiration Cards' : 'Favorite Cards';
    
    // Render cards
    renderCards();
}

// Filter by tag
function filterByTag(tagId) {
    currentTagFilter = tagId;
    currentView = 'all';
    allCardsBtn.classList.add('active');
    favoritesBtn.classList.remove('active');
    
    const tag = tags.find(t => t.id === tagId);
    boardTitle.textContent = `Cards tagged with "${tag.name}"`;
    
    renderCards();
}

// Open card modal
function openCardModal(card = null) {
    if (card) {
        // Edit mode
        modalTitle.textContent = 'Edit Card';
        cardTitle.value = card.title;
        cardText.value = card.content;
        cardTags.value = card.tags.map(tagId => {
            const tag = tags.find(t => t.id === tagId);
            return tag ? tag.name : '';
        }).join(', ');
        cardColor.value = card.color || '#ffffff';
        editCardId = card.id;
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Card';
        cardTitle.value = '';
        cardText.value = '';
        cardTags.value = '';
        cardColor.value = '#ffffff';
        editCardId = null;
    }
    
    cardModal.style.display = 'flex';
}

// Save card
function saveCardHandler() {
    const title = cardTitle.value.trim();
    const content = cardText.value.trim();
    const tagInput = cardTags.value.split(',').map(t => t.trim()).filter(t => t); // Cambiado el nombre de la variable
    const color = cardColor.value;
    
    if (!title || !content) {
        alert('Please enter both title and content');
        return;
    }
    
    // Find or create tags
    const cardTagIds = []; // Cambiado el nombre de la variable
    tagInput.forEach(tagName => {
        let tag = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
        if (!tag) {
            tag = {
                id: Date.now().toString(),
                name: tagName,
                color: '#669bbc',
                userId: currentUser.id
            };
            tags.push(tag);
            localStorage.setItem('tags', JSON.stringify(tags));
        }
        cardTagIds.push(tag.id);
    });
    
    if (editCardId) {
        // Update existing card
        const cardIndex = cards.findIndex(c => c.id === editCardId);
        if (cardIndex !== -1) {
            cards[cardIndex] = {
                ...cards[cardIndex],
                title,
                content,
                tags: cardTagIds, // Usamos el nuevo nombre de variable
                color
            };
        }
    } else {
        // Add new card
        const newCard = {
            id: Date.now().toString(),
            title,
            content,
            tags: cardTagIds, // Usamos el nuevo nombre de variable
            color,
            isFavorite: false,
            userId: currentUser.id,
            createdAt: new Date().toISOString()
        };
        cards.push(newCard);
    }
    
    saveCards();
    renderCards();
    renderTags();
    closeModal();
}

// Open tag modal
function openTagModal(tag = null) {
    if (tag) {
        // Edit mode
        tagName.value = tag.name;
        tagColor.value = tag.color;
        deleteTagId = tag.id;
    } else {
        // Add mode
        tagName.value = '';
        tagColor.value = '#669bbc';
        deleteTagId = null;
    }
    
    tagModal.style.display = 'flex';
}

// Save tag
function saveTagHandler() {
    const name = tagName.value.trim();
    const color = tagColor.value;
    
    if (!name) {
        alert('Please enter a tag name');
        return;
    }
    
    if (deleteTagId) {
        // Update existing tag
        const tagIndex = tags.findIndex(t => t.id === deleteTagId);
        if (tagIndex !== -1) {
            tags[tagIndex] = {
                ...tags[tagIndex],
                name,
                color
            };
        }
    } else {
        // Add new tag
        const newTag = {
            id: Date.now().toString(),
            name,
            color,
            userId: currentUser.id
        };
        tags.push(newTag);
    }
    
    localStorage.setItem('tags', JSON.stringify(tags));
    renderTags();
    closeModal();
}

// Close modal
function closeModal() {
    cardModal.style.display = 'none';
    tagModal.style.display = 'none';
    confirmModal.style.display = 'none';
}

// Load users from localStorage
function loadUsers() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
}

// Load cards from localStorage
function loadCards() {
    const allCards = JSON.parse(localStorage.getItem('cards')) || [];
    cards = allCards.filter(card => card.userId === currentUser.id);
    renderCards();
}

// Save cards to localStorage
function saveCards() {
    const allCards = JSON.parse(localStorage.getItem('cards')) || [];
    
    // Remove user's existing cards
    const otherCards = allCards.filter(card => card.userId !== currentUser.id);
    
    // Add updated cards
    const updatedCards = [...otherCards, ...cards];
    localStorage.setItem('cards', JSON.stringify(updatedCards));
}

// Load tags from localStorage
function loadTags() {
    const allTags = JSON.parse(localStorage.getItem('tags')) || [];
    tags = allTags.filter(tag => tag.userId === currentUser.id);
}

// Render cards
function renderCards() {
    board.innerHTML = '';
    
    let filteredCards = [...cards];
    
    // Apply view filter
    if (currentView === 'favorites') {
        filteredCards = filteredCards.filter(card => card.isFavorite);
    }
    
    // Apply tag filter
    if (currentTagFilter) {
        filteredCards = filteredCards.filter(card => 
            card.tags.includes(currentTagFilter)
        );
    }
    
    // Sort by creation date (newest first)
    filteredCards.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Create card elements
    filteredCards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.style.borderTopColor = card.color;
        
        const cardTags = card.tags.map(tagId => {
            const tag = tags.find(t => t.id === tagId);
            return tag ? { ...tag } : null;
        }).filter(tag => tag);
        
        cardEl.innerHTML = `
            <h3 class="card-title">${card.title}</h3>
            <p class="card-content">${card.content}</p>
            <div class="card-footer">
                <div class="card-tags">
                    ${cardTags.map(tag => `
                        <span class="card-tag" style="background-color: ${tag.color}">
                            ${tag.name}
                        </span>
                    `).join('')}
                </div>
                <div class="card-actions">
                    <button class="card-btn favorite-btn ${card.isFavorite ? 'favorite' : ''}">
                        <i class="fas fa-star"></i>
                    </button>
                    <button class="card-btn edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="card-btn delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners
        const favoriteBtn = cardEl.querySelector('.favorite-btn');
        const editBtn = cardEl.querySelector('.edit-btn');
        const deleteBtn = cardEl.querySelector('.delete-btn');
        
        favoriteBtn.addEventListener('click', () => toggleFavorite(card.id));
        editBtn.addEventListener('click', () => openCardModal(card));
        deleteBtn.addEventListener('click', () => confirmDeleteCard(card.id));
        
        board.appendChild(cardEl);
    });
}

// Render tags
function renderTags() {
    tagsList.innerHTML = '';
    
    tags.forEach(tag => {
        const tagEl = document.createElement('div');
        tagEl.className = 'tag-item';
        tagEl.innerHTML = `
            <span class="tag-color" style="background-color: ${tag.color}"></span>
            <span class="tag-name">${tag.name}</span>
        `;
        
        tagEl.addEventListener('click', () => filterByTag(tag.id));
        
        // Add context menu for editing/deleting tags
        tagEl.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            openTagModal(tag);
        });
        
        tagsList.appendChild(tagEl);
    });
}

// Toggle favorite status
function toggleFavorite(cardId) {
    const cardIndex = cards.findIndex(c => c.id === cardId);
    if (cardIndex !== -1) {
        cards[cardIndex].isFavorite = !cards[cardIndex].isFavorite;
        saveCards();
        renderCards();
    }
}

// Confirm card deletion
function confirmDeleteCard(cardId) {
    confirmMessage.textContent = 'Are you sure you want to delete this card?';
    confirmAction.textContent = 'Delete';
    
    confirmAction.onclick = () => {
        deleteCard(cardId);
        closeModal();
    };
    
    confirmModal.style.display = 'flex';
}

// Delete card
function deleteCard(cardId) {
    cards = cards.filter(c => c.id !== cardId);
    saveCards();
    renderCards();
}

// Initialize the app
init();