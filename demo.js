// ============================================
// 🎬 ARTistico — Product Showcase Demo
// ============================================

// ==== আপনার ১১টা প্রোডাক্ট ====
const products = [
    {
        name: "Vishal Dashing",
        price: 399,
        image: "https://res.cloudinary.com/sqz4fxak/image/upload/v1790849615/IMG-20260929-WA0005.jpg.jpg",
        bg: "#c9e78a"
    },
    {
        name: "INTERGUO",
        price: 399,
        image: "https://res.cloudinary.com/sqz4fxak/image/upload/v1790849475/1790844956900.jpg.jpg",
        bg: "#b8d4c8"
    },
    {
        name: "SC Business",
        price: 399,
        image: "https://res.cloudinary.com/sqz4fxak/image/upload/v1790849557/IMG-20260929-WA0004.jpg.jpg",
        bg: "#e0e8dc"
    },
    {
        name: "SOUL Blue",
        price: 399,
        image: "https://res.cloudinary.com/sqz4fxak/image/upload/v1790849518/IMG-20260929-WA0001.jpg.jpg",
        bg: "#a8c4d8"
    },
    {
        name: "Calvin Klein",
        price: 399,
        image: "https://res.cloudinary.com/sqz4fxak/image/upload/v1790847170/1790845002431.jpg.jpg",
        bg: "#a0ccc4"
    },
    {
        name: "G2000",
        price: 399,
        image: "https://res.cloudinary.com/sqz4fxak/image/upload/v1790847128/1790844475969.jpg.jpg",
        bg: "#b8c8d8"
    },
    {
        name: "Babidi",
        price: 399,
        image: "https://res.cloudinary.com/sqz4fxak/image/upload/v1790847183/1790844257527.jpg.jpg",
        bg: "#d0d8e0"
    },
    {
        name: "Classic Light Blue",
        price: 399,
        image: "https://res.cloudinary.com/sqz4fxak/image/upload/v1790847199/1790844215085.jpg.jpg",
        bg: "#b4c4d4"
    },
    {
        name: "Goldlion",
        price: 399,
        image: "https://res.cloudinary.com/sqz4fxak/image/upload/v1790847213/1790844136409.jpg.jpg",
        bg: "#d8cfc0"
    },
    {
        name: "UNCYGINDON",
        price: 399,
        image: "https://res.cloudinary.com/sqz4fxak/image/upload/v1790847309/1790844317172.jpg.jpg",
        bg: "#c4d4c8"
    },
    {
        name: "Yishion Sage",
        price: 399,
        image: "https://res.cloudinary.com/sqz4fxak/image/upload/v1790847462/1790844683558.jpg.jpg",
        bg: "#c9d4bc"
    }
];

// ==== State ====
let currentIndex = 0;
const totalProducts = products.length;

// ==== DOM ====
const slideContainer = document.getElementById('slideContainer');
const shirtTitle = document.getElementById('shirtTitle');
const shirtPrice = document.getElementById('shirtPrice');
const currentNum = document.getElementById('currentNum');
const totalNum = document.getElementById('totalNum');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const loading = document.getElementById('loading');
const demoLogo = document.querySelector('.demo-logo');

// ==== Init ====
function init() {
    totalNum.textContent = totalProducts;

    products.forEach((product, i) => {
        const slide = document.createElement('div');
        slide.className = 'slide';
        slide.style.backgroundColor = product.bg;
        slide.dataset.index = i;

        slide.innerHTML = `
            <div class="slide-image-wrapper">
                <img src="${product.image}" alt="${product.name}" 
                     onerror="this.src='https://placehold.co/600x800/e0f7ff/003d7a?text=ARTistico'">
            </div>
        `;

        slideContainer.appendChild(slide);
    });

    loading.style.display = 'none';

    updateSlide();
    updateNavButtons();

    if (window.gsap) {
        gsap.from('.demo-logo', {
            opacity: 0,
            y: -20,
            duration: 0.8,
            ease: 'power3.out'
        });
    }
}

// ==== Update slide ====
function updateSlide() {
    const offset = -currentIndex * 100;
    slideContainer.style.transform = `translateX(${offset}vw)`;

    const product = products[currentIndex];
    shirtTitle.textContent = product.name;
    shirtPrice.textContent = `৳${product.price}`;
    currentNum.textContent = currentIndex + 1;

    if (window.gsap) {
        gsap.fromTo('#shirtTitle',
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
        );
        gsap.fromTo('.price-badge',
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
        );
        gsap.fromTo('.slide-image-wrapper img',
            { scale: 1.1, opacity: 0.6 },
            { scale: 1, opacity: 1, duration: 0.8, ease: 'power3.out' }
        );
    }

    if (demoLogo) {
        demoLogo.style.color = '#294d3b';
    }
}

// ==== Nav buttons ====
function updateNavButtons() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === totalProducts - 1;
}

nextBtn.addEventListener('click', () => {
    if (currentIndex < totalProducts - 1) {
        currentIndex++;
        updateSlide();
        updateNavButtons();
    }
});

prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        updateSlide();
        updateNavButtons();
    }
});

// ==== Keyboard ====
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' && currentIndex < totalProducts - 1) {
        currentIndex++;
        updateSlide();
        updateNavButtons();
    } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        currentIndex--;
        updateSlide();
        updateNavButtons();
    }
});

// ==== Touch/Swipe ====
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
        if (diff > 0 && currentIndex < totalProducts - 1) {
            currentIndex++;
            updateSlide();
            updateNavButtons();
        } else if (diff < 0 && currentIndex > 0) {
            currentIndex--;
            updateSlide();
            updateNavButtons();
        }
    }
}, { passive: true });

// ==== Start ====
init();
console.log('🎬 Demo initialized with', totalProducts, 'products');
