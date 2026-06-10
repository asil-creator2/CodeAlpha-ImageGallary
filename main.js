const modal = document.getElementById('modal');
const modalImage = document.getElementById('modal-image');
const themeToggle = document.getElementById('theme-toggle');
const filterButtons = document.querySelectorAll('.filter-btn');
const imageButtons = document.querySelectorAll('.image-button');
const closeBtn = document.querySelector('.close-btn');
const nextBtn = document.querySelector('.right-arrow');
const prevBtn = document.querySelector('.left-arrow');
const modalBackdrop = document.querySelector('.modal-backdrop');
const gallery = document.getElementById('gallery');

let currentIndex = 0;
let activeImages = Array.from(imageButtons);
let lastFocusedButton = null;

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const isLight = theme === 'light';
    themeToggle.textContent = isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    themeToggle.setAttribute('aria-pressed', String(isLight));
    localStorage.setItem('galleryTheme', theme);
}

function initTheme() {
    const savedTheme = localStorage.getItem('galleryTheme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    setTheme(savedTheme || (prefersLight ? 'light' : 'dark'));
}

function trapFocus(event) {
    const focusableElements = modal.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (event.key !== 'Tab') {
        return;
    }

    if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
            event.preventDefault();
            lastFocusable.focus();
        }
    } else {
        if (document.activeElement === lastFocusable) {
            event.preventDefault();
            firstFocusable.focus();
        }
    }
}

function openModal(index) {
    currentIndex = index;
    lastFocusedButton = document.activeElement;
    updateModalImage();
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    closeBtn.focus();
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (lastFocusedButton instanceof HTMLElement) {
        lastFocusedButton.focus();
    }
}

function updateModalImage() {
    const button = activeImages[currentIndex];
    const image = button.querySelector('img');
    modalImage.src = image.src;
    modalImage.alt = image.alt;
}

function showNextImage() {
    if (activeImages.length === 0) return;
    currentIndex = (currentIndex + 1) % activeImages.length;
    updateModalImage();
}

function showPrevImage() {
    if (activeImages.length === 0) return;
    currentIndex = (currentIndex - 1 + activeImages.length) % activeImages.length;
    updateModalImage();
}

function filterImages(category) {
    const cards = document.querySelectorAll('.image-card');
    cards.forEach((card) => {
        const matches = category === 'all' || card.classList.contains(category);
        card.hidden = !matches;
    });

    activeImages = Array.from(document.querySelectorAll('.image-card:not([hidden]) .image-button'));
    gallery.setAttribute('aria-busy', 'true');
    window.requestAnimationFrame(() => gallery.setAttribute('aria-busy', 'false'));
}

function setActiveFilter(button) {
    filterButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
}

function handleFilterClick(event) {
    const button = event.currentTarget;
    const category = button.dataset.filter;
    if (!category) return;
    setActiveFilter(button);
    filterImages(category);
}

function handleImageClick(event) {
    const button = event.currentTarget;
    const visibleButtons = Array.from(document.querySelectorAll('.image-card:not([hidden]) .image-button'));
    const index = visibleButtons.indexOf(button);
    if (index === -1) return;
    activeImages = visibleButtons;
    openModal(index);
}

function handleKeyDown(event) {
    if (!modal.classList.contains('active')) return;

    switch (event.key) {
        case 'Escape':
            event.preventDefault();
            closeModal();
            break;
        case 'ArrowRight':
            event.preventDefault();
            showNextImage();
            break;
        case 'ArrowLeft':
            event.preventDefault();
            showPrevImage();
            break;
        default:
            break;
    }
}

themeToggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
});

filterButtons.forEach((button) => button.addEventListener('click', handleFilterClick));
imageButtons.forEach((button) => button.addEventListener('click', handleImageClick));


nextBtn.addEventListener('click', showNextImage);
prevBtn.addEventListener('click', showPrevImage);
closeBtn.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);
modal.addEventListener('keydown', trapFocus);
document.addEventListener('keydown', handleKeyDown);

initTheme();
filterImages('all');
