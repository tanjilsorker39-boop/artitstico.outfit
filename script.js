// =============================================
// 🔥 Firebase থেকে প্রোডাক্ট লোড
// =============================================
let products = [];

const FIREBASE_URL = "https://artistico-c3a5e-default-rtdb.asia-southeast1.firebasedatabase.app";
const WHATSAPP_NUMBER = "8801636032218";

async function loadProductsFromFirebase() {
    try {
        showLoadingSkeleton();
        const res = await fetch(FIREBASE_URL + "/Products.json");
        const data = await res.json();
        if (data) {
            products = Object.values(data).filter(p => p && p.name && p.id);
            renderProducts();
            renderRecentlyViewed();
            renderWishlist();
        } else {
            console.warn("Firebase-এ কোনো প্রোডাক্ট নেই");
        }
    } catch (err) {
        console.error("প্রোডাক্ট লোড হয়নি:", err);
    }
}

let cart = [];
let selectedCategory = "all";
let wishlist = JSON.parse(localStorage.getItem('artisticoWishlist') || '[]');
let recentlyViewed = JSON.parse(localStorage.getItem('artisticoRecentlyViewed') || '[]');

const productsGrid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const cartButton = document.getElementById("cartButton");
const cartModal = document.getElementById("cartModal");
const closeCartButton = document.getElementById("closeCartButton");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartSubtotal = document.getElementById("cartSubtotal");
const deliveryCost = document.getElementById("deliveryCost");
const cartTotal = document.getElementById("cartTotal");
const checkoutButton = document.getElementById("checkoutButton");
const checkoutForm = document.getElementById("checkoutForm");
const paymentInstruction = document.getElementById("paymentInstruction");
const toast = document.getElementById("toast");

const sizeChartModal = document.getElementById("sizeChartModal");
const closeSizeChart = document.getElementById("closeSizeChart");

const darkModeToggle = document.getElementById("darkModeToggle");
const themeIcon = darkModeToggle ? darkModeToggle.querySelector(".theme-icon") : null;
const liveChatButton = document.getElementById("liveChatButton");
const breadcrumbCurrent = document.getElementById("breadcrumbCurrent");

const wishlistButton = document.getElementById("wishlistButton");
const wishlistModal = document.getElementById("wishlistModal");
const closeWishlist = document.getElementById("closeWishlist");
const wishlistItems = document.getElementById("wishlistItems");
const wishlistCount = document.getElementById("wishlistCount");

const recentlyViewedSection = document.getElementById("recentlyViewed");
const recentlyViewedGrid = document.getElementById("recentlyViewedGrid");

function money(value) {
    return "৳" + Number(value).toLocaleString("en-BD");
}

function getSelectedDeliveryInput() {
    return document.querySelector('input[name="delivery"]:checked');
}

function getSelectedDelivery() {
    const el = getSelectedDeliveryInput();
    return Number(el ? el.value : 0);
}

function getDeliveryArea() {
    const el = getSelectedDeliveryInput();
    return (el && el.value === "120") ? "ঢাকার বাইরে" : "ঢাকার ভিতরে";
}

function getSelectedPayment() {
    const el = document.querySelector('input[name="payment"]:checked');
    return el ? el.value : "bKash";
}

function getSubtotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function openSizeChart() {
    if (!sizeChartModal) return;
    sizeChartModal.classList.add("active");
    sizeChartModal.setAttribute("aria-hidden", "false");
}

function closeSizeChartModal() {
    if (!sizeChartModal) return;
    sizeChartModal.classList.remove("active");
    sizeChartModal.setAttribute("aria-hidden", "true");
}

function showLoadingSkeleton() {
    if (!productsGrid) return;
    let skeletonHTML = "";
    for (let i = 0; i < 6; i++) {
        skeletonHTML += '<article class="product-card skeleton-card"><div class="product-image skeleton-image"></div><div class="product-info"><div class="skeleton-line skeleton-small"></div><div class="skeleton-line skeleton-medium"></div><div class="skeleton-line skeleton-large"></div></div></article>';
    }
    productsGrid.innerHTML = skeletonHTML;
}

function updateBreadcrumb(categoryName) {
    if (!breadcrumbCurrent) return;
    if (!categoryName || categoryName === "all") {
        breadcrumbCurrent.textContent = "All Products";
    } else {
        const labels = { mens: "Men's", womens: "Women's", boys: "Boys", unisex: "Unisex" };
        breadcrumbCurrent.textContent = labels[categoryName] || categoryName;
    }
}

function addToRecentlyViewed(productId) {
    recentlyViewed = recentlyViewed.filter(id => id !== productId);
    recentlyViewed.unshift(productId);
    recentlyViewed = recentlyViewed.slice(0, 4);
    localStorage.setItem('artisticoRecentlyViewed', JSON.stringify(recentlyViewed));
}

function renderRecentlyViewed() {
    if (!recentlyViewedSection || !recentlyViewedGrid) return;
    if (recentlyViewed.length === 0) {
        recentlyViewedSection.style.display = 'none';
        return;
    }
    const recentProducts = recentlyViewed.map(id => products.find(p => p.id === Number(id))).filter(p => p);
    if (recentProducts.length === 0) {
        recentlyViewedSection.style.display = 'none';
        return;
    }
    recentlyViewedSection.style.display = 'block';
    recentlyViewedGrid.innerHTML = recentProducts.map(product => {
        const n = product.name || "Product";
        return '<article class="product-card" onclick="scrollToProduct(' + product.id + ')"><div class="product-image"><span class="product-badge">দেখেছেন</span><img src="' + product.image + '" alt="' + n + '" loading="lazy" onerror="this.src=\'https://placehold.co/600x600/e0f7ff/003d7a?text=ARTistico\'"></div><div class="product-info"><div class="product-category">' + product.category + '</div><h3 class="product-name">' + n + '</h3><div class="product-price">' + money(product.price) + '</div></div></article>';
    }).join("");
}

function scrollToProduct(id) {
    const element = document.querySelector('.btn-add-cart[data-product="' + id + '"]');
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function toggleWishlist(productId) {
    const id = Number(productId);
    const index = wishlist.indexOf(id);
    if (index > -1) {
        wishlist.splice(index, 1);
        showToast("Wishlist থেকে সরানো হয়েছে");
    } else {
        wishlist.push(id);
        showToast("❤️ Wishlist-এ যোগ হয়েছে");
    }
    localStorage.setItem('artisticoWishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    renderProducts();
    renderWishlist();
}

function updateWishlistCount() {
    if (wishlistCount) wishlistCount.textContent = wishlist.length;
}

function renderWishlist() {
    if (!wishlistItems) return;
    if (wishlist.length === 0) {
        wishlistItems.innerHTML = '<div class="empty-cart">আপনার wishlist খালি। ❤️ যোগ করুন।</div>';
        return;
    }
    const wishProducts = wishlist.map(id => products.find(p => p.id === Number(id))).filter(p => p);
    wishlistItems.innerHTML = wishProducts.map(product => {
        const n = product.name || "Product";
        return '<div class="wishlist-item"><img src="' + product.image + '" alt="' + n + '" class="wishlist-image"><div class="wishlist-info"><h3>' + n + '</h3><p>' + money(product.price) + '</p></div><button type="button" class="wishlist-remove" onclick="toggleWishlist(' + product.id + ')">❌</button></div>';
    }).join("");
}

function openWishlist() {
    if (!wishlistModal) return;
    renderWishlist();
    wishlistModal.classList.add("active");
    wishlistModal.setAttribute("aria-hidden", "false");
}

function closeWishlistModal() {
    if (!wishlistModal) return;
    wishlistModal.classList.remove("active");
    wishlistModal.setAttribute("aria-hidden", "true");
}

function renderProducts() {
    if (!productsGrid) return;
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
        const matchesSearch = (product.name || "").toLowerCase().includes(searchTerm) || (product.description || "").toLowerCase().includes(searchTerm);
        return matchesCategory && matchesSearch;
    });

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<p class="empty-cart">কোনো শার্ট পাওয়া যায়নি।</p>';
        return;
    }

    productsGrid.innerHTML = filteredProducts.map(product => {
        const stock = product.quantity !== undefined ? Number(product.quantity) : 10;
        const isOutOfStock = stock <= 0;
        const productName = product.name || "Product";
        const isWishlisted = wishlist.includes(product.id);
        const whatsappMsg = encodeURIComponent('আসসালামু আলাইকুম, আমি "' + productName + '" (৳' + product.price + ') সম্পর্কে জানতে চাই।');
        const whatsappLink = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + whatsappMsg;
        const shareMsg = encodeURIComponent("ARTistico-তে দেখুন: " + productName + " — ৳" + product.price);
        const shareUrl = encodeURIComponent("https://artisticooutfit.vercel.app");

        return '<article class="product-card" data-product-id="' + product.id + '">' +
            '<div class="product-image">' +
            '<span class="product-badge">থ্রিফটেড</span>' +
            (isOutOfStock ? '<span class="stock-badge">STOCK OUT</span>' : '') +
            '<img src="' + product.image + '" alt="' + productName + '" loading="lazy" onerror="this.src=\'https://placehold.co/600x600/e0f7ff/003d7a?text=ARTistico\'">' +
            '<button type="button" class="wishlist-heart ' + (isWishlisted ? 'active' : '') + '" onclick="event.stopPropagation(); toggleWishlist(' + product.id + ')" aria-label="Wishlist">' + (isWishlisted ? '❤️' : '🤍') + '</button>' +
            '<div class="share-buttons">' +
            '<a href="https://www.facebook.com/sharer/sharer.php?u=' + shareUrl + '" target="_blank" class="share-btn share-fb" title="Share on Facebook"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>' +
            '<a href="https://wa.me/?text=' + shareMsg + '%20' + shareUrl + '" target="_blank" class="share-btn share-wa" title="Share on WhatsApp"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></a>' +
            '</div></div>' +
            '<div class="product-info">' +
            '<div class="product-category">' + product.category + '</div>' +
            '<h3 class="product-name">' + productName + '</h3>' +
            '<p class="product-description">' + product.description + '</p>' +
            '<div class="product-price">' + money(product.price) + '</div>' +
            '<div class="size-selector">' +
            (product.sizes || ["M", "L", "XL"]).map((size, index) => '<button type="button" class="size-btn ' + (index === 0 ? 'selected' : '') + '" data-product="' + product.id + '" data-size="' + size + '">' + size + '</button>').join("") +
            '</div>' +
            '<button type="button" class="btn-size-guide" onclick="openSizeChart()">📏 Size Guide</button>' +
            '<button type="button" class="btn-add-cart ' + (isOutOfStock ? 'disabled' : '') + '" data-product="' + product.id + '"' + (isOutOfStock ? ' disabled' : '') + '>' + (isOutOfStock ? 'স্টক শেষ' : 'কার্টে যোগ করুন') + '</button>' +
            '<a href="' + whatsappLink + '" target="_blank" class="btn-whatsapp"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg> WhatsApp-এ জিজ্ঞেস করুন</a>' +
            '</div></article>';
    }).join("");
}

function renderCart() {
    if (!cartCount) return;
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (cart.length === 0) {
        if (cartItems) cartItems.innerHTML = '<div class="empty-cart">আপনার কার্ট খালি।</div>';
        if (cartSubtotal) cartSubtotal.textContent = money(0);
        if (deliveryCost) deliveryCost.textContent = money(0);
        if (cartTotal) cartTotal.textContent = money(0);
        if (checkoutForm) checkoutForm.hidden = true;
        return;
    }

    if (cartItems) {
        cartItems.innerHTML = cart.map(item => '<div class="cart-item"><div><h3>' + item.name + '</h3><p>' + money(item.price) + ' · সাইজ ' + item.size + '</p></div><div class="quantity-control"><button type="button" class="quantity-btn" data-action="decrease" data-id="' + item.cartId + '">−</button><span>' + item.quantity + '</span><button type="button" class="quantity-btn" data-action="increase" data-id="' + item.cartId + '">+</button><button type="button" class="remove-btn" data-action="remove" data-id="' + item.cartId + '">রিমুভ</button></div></div>').join("");
    }
    updateTotals();
}

function updateTotals() {
    const subtotal = getSubtotal();
    const delivery = cart.length ? getSelectedDelivery() : 0;
    if (cartSubtotal) cartSubtotal.textContent = money(subtotal);
    if (deliveryCost) deliveryCost.textContent = money(delivery);
    if (cartTotal) cartTotal.textContent = money(subtotal + delivery);
}

function updatePaymentInstruction() {
    const payment = getSelectedPayment();
    const deliveryCharge = getSelectedDelivery();
    const bkashFields = document.getElementById('bkashFields');
    const nagadFields = document.getElementById('nagadFields');

    if (bkashFields) bkashFields.style.display = payment === 'bKash' ? 'block' : 'none';
    if (nagadFields) nagadFields.style.display = payment === 'Nagad' ? 'block' : 'none';

    const advanceAmount = document.getElementById('advanceAmount');
    if (advanceAmount) {
        advanceAmount.textContent = "৳" + deliveryCharge;
    }
}

function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => { toast.classList.remove("show"); }, 3000);
}

function openCart() {
    if (!cartModal) return;
    cartModal.classList.add("active");
    cartModal.setAttribute("aria-hidden", "false");
    renderCart();
    updatePaymentInstruction();
}

function closeCart() {
    if (!cartModal) return;
    cartModal.classList.remove("active");
    cartModal.setAttribute("aria-hidden", "true");
}

function bumpCartIcon() {
    if (!cartButton) return;
    cartButton.classList.add("bump");
    setTimeout(() => cartButton.classList.remove("bump"), 600);
}

if (productsGrid) {
    productsGrid.addEventListener("click", event => {
        const sizeButton = event.target.closest(".size-btn");
        if (sizeButton) {
            const productId = sizeButton.dataset.product;
            document.querySelectorAll('.size-btn[data-product="' + productId + '"]').forEach(button => button.classList.remove("selected"));
            sizeButton.classList.add("selected");
            return;
        }

        const addButton = event.target.closest(".btn-add-cart");
        if (!addButton) return;
        if (addButton.disabled) return;

        const product = products.find(item => item.id === Number(addButton.dataset.product));
        if (!product) return;

        addToRecentlyViewed(product.id);

        const selectedSizeButton = document.querySelector('.size-btn[data-product="' + product.id + '"].selected');
        const sizes = product.sizes || ["M", "L", "XL"];
        const selectedSize = selectedSizeButton ? selectedSizeButton.dataset.size : sizes[0];
        const cartId = product.id + "-" + selectedSize;
        const existingItem = cart.find(item => item.cartId === cartId);
        const maxQty = product.quantity !== undefined ? Number(product.quantity) : 10;

        if (existingItem) {
            if (existingItem.quantity >= maxQty) {
                showToast("⚠️ স্টকে মাত্র " + maxQty + "টা আছে!");
                return;
            }
            existingItem.quantity++;
        } else {
            if (maxQty <= 0) {
                showToast("❌ এই প্রোডাক্টের স্টক শেষ!");
                return;
            }
            cart.push({
                cartId: cartId,
                id: product.id,
                name: product.name,
                price: product.price,
                size: selectedSize,
                quantity: 1
            });
        }

        renderCart();
        bumpCartIcon();
        showToast(product.name + " কার্টে যোগ হয়েছে");
    });
}

if (cartItems) {
    cartItems.addEventListener("click", event => {
        const button = event.target.closest("button");
        if (!button) return;
        const item = cart.find(entry => entry.cartId === button.dataset.id);
        if (!item) return;

        if (button.dataset.action === "increase") {
            const prod = products.find(p => p.id === item.id);
            const maxQty = prod && prod.quantity !== undefined ? Number(prod.quantity) : 10;
            if (item.quantity >= maxQty) {
                showToast("⚠️ স্টকে মাত্র " + maxQty + "টা আছে!");
                return;
            }
            item.quantity++;
        }
        if (button.dataset.action === "decrease") item.quantity--;
        if (button.dataset.action === "remove") item.quantity = 0;

        cart = cart.filter(entry => entry.quantity > 0);
        renderCart();
    });
}

document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
        const active = document.querySelector(".filter-btn.active");
        if (active) active.classList.remove("active");
        button.classList.add("active");
        selectedCategory = button.dataset.category;
        updateBreadcrumb(selectedCategory);
        renderProducts();
    });
});

document.querySelectorAll('input[name="delivery"]').forEach(input => {
    input.addEventListener("change", () => {
        updateTotals();
        updatePaymentInstruction();
    });
});

document.querySelectorAll('input[name="payment"]').forEach(input => {
    input.addEventListener("change", updatePaymentInstruction);
});

if (searchInput) {
    searchInput.addEventListener("input", () => {
        const term = searchInput.value.trim();
        if (breadcrumbCurrent) {
            if (term) {
                breadcrumbCurrent.textContent = 'Search: "' + term + '"';
            } else {
                updateBreadcrumb(selectedCategory);
            }
        }
        renderProducts();
    });
}

if (cartButton) cartButton.addEventListener("click", openCart);
if (closeCartButton) closeCartButton.addEventListener("click", closeCart);
if (cartModal) {
    cartModal.addEventListener("click", event => {
        if (event.target === cartModal) closeCart();
    });
}

if (closeSizeChart) closeSizeChart.addEventListener("click", closeSizeChartModal);
if (sizeChartModal) {
    sizeChartModal.addEventListener("click", event => {
        if (event.target === sizeChartModal) closeSizeChartModal();
    });
}

if (wishlistButton) wishlistButton.addEventListener("click", openWishlist);
if (closeWishlist) closeWishlist.addEventListener("click", closeWishlistModal);
if (wishlistModal) {
    wishlistModal.addEventListener("click", event => {
        if (event.target === wishlistModal) closeWishlistModal();
    });
}

if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
        if (cart.length === 0) {
            showToast("কার্টে একটি প্রোডাক্ট যোগ করুন।");
            return;
        }
        checkoutForm.hidden = false;
        checkoutForm.scrollIntoView({ behavior: "smooth", block: "nearest" });
        updatePaymentInstruction();
    });
}

function loadTheme() {
    const savedTheme = localStorage.getItem("artisticoTheme") || "light";
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        if (themeIcon) themeIcon.textContent = "☀️";
    } else {
        document.body.classList.remove("dark-mode");
        if (themeIcon) themeIcon.textContent = "🌙";
    }
}

if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const isDark = document.body.classList.contains("dark-mode");
        localStorage.setItem("artisticoTheme", isDark ? "dark" : "light");
        if (themeIcon) themeIcon.textContent = isDark ? "☀️" : "🌙";
    });
}

loadTheme();

if (liveChatButton) {
    liveChatButton.addEventListener("click", () => {
        const msg = encodeURIComponent("আসসালামু আলাইকুম, ARTistico থেকে সহায়তা চাই।");
        window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + msg, "_blank");
    });
}

if (checkoutForm) {
    checkoutForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (cart.length === 0) {
            showToast("আপনার কার্ট খালি।");
            checkoutForm.hidden = true;
            return;
        }

        if (!checkoutForm.checkValidity()) {
            checkoutForm.reportValidity();
            return;
        }

        const payment = getSelectedPayment();
        const formData = new FormData(checkoutForm);
        const deliveryCharge = getSelectedDelivery();
        const deliveryArea = getDeliveryArea();
        const subtotal = getSubtotal();
        const total = subtotal + deliveryCharge;

        const senderField = payment === 'bKash' ? 'bkashSender' : 'nagadSender';
        const trxField = payment === 'bKash' ? 'bkashTransactionId' : 'nagadTransactionId';

        const senderEl = document.getElementById(senderField);
        const trxEl = document.getElementById(trxField);
        const senderNumber = senderEl ? senderEl.value.trim() : "";
        const trxId = trxEl ? trxEl.value.trim().toUpperCase() : "";

        if (!senderNumber || senderNumber.length !== 11 || !/^01[3-9]\d{8}$/.test(senderNumber)) {
            showToast("❌ সঠিক ১১ ডিজিটের নম্বর দিন (01XXXXXXXXX)");
            return;
        }

        if (!trxId || trxId.length < 8) {
            showToast("❌ TrxID কমপক্ষে ৮ অক্ষরের হতে হবে");
            return;
        }

        if (!/^[A-Z0-9]+$/.test(trxId)) {
            showToast("❌ TrxID-এ শুধু A-Z ও 0-9 থাকবে");
            return;
        }

        try {
            const checkRes = await fetch(FIREBASE_URL + "/Orders.json");
            const existingOrders = await checkRes.json();
            if (existingOrders) {
                const allOrders = Object.values(existingOrders);
                const duplicate = allOrders.find(o => o && o.trxId && o.trxId.toUpperCase() === trxId);
                if (duplicate) {
                    showToast("❌ এই TrxID আগে ব্যবহার হয়েছে!");
                    return;
                }
                const sameSenderCount = allOrders.filter(o => o && o.senderNumber === senderNumber).length;
                if (sameSenderCount >= 3) {
                    if (!confirm("⚠️ এই নম্বর দিয়ে অনেক অর্ডার হয়েছে। চালিয়ে যাবেন?")) {
                        return;
                    }
                }
            }
        } catch (err) {
            console.error("Fraud check error:", err);
        }

        const orderNumber = "ART-" + Date.now().toString().slice(-6);

        const order = {
            orderNumber: orderNumber,
            customer: {
                name: formData.get("customerName"),
                phone: formData.get("customerPhone"),
                email: formData.get("customerEmail"),
                address: formData.get("customerAddress")
            },
            delivery: { area: deliveryArea, charge: deliveryCharge },
            items: cart.map(item => ({
                name: item.name,
                size: item.size,
                quantity: item.quantity,
                price: item.price,
                productId: item.id
            })),
            subtotal: subtotal,
            deliveryCharge: deliveryCharge,
            total: total,
            advancePaid: deliveryCharge,
            codAmount: subtotal,
            payment: payment,
            senderNumber: senderNumber,
            trxId: trxId,
            status: "pending_verification",
            createdAt: new Date().toISOString()
        };

        const submitBtn = checkoutForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Order জমা হচ্ছে...";
        }

        try {
            await fetch(FIREBASE_URL + "/Orders.json", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            });

            const orders = JSON.parse(localStorage.getItem('artisticoOrders') || '[]');
            orders.push({
                orderId: order.orderNumber,
                customer: order.customer.name,
                phone: order.customer.phone,
                address: order.customer.address,
                payment: order.payment,
                items: order.items.map(i => i.name + " (" + i.size + ") x" + i.quantity).join(', '),
                total: order.total,
                advancePaid: order.advancePaid,
                codAmount: order.codAmount,
                senderNumber: order.senderNumber,
                trxId: order.trxId,
                status: 'pending_verification'
            });
            localStorage.setItem('artisticoOrders', JSON.stringify(orders));

            checkoutForm.reset();
            checkoutForm.hidden = true;
            cart = [];
            renderCart();
            updatePaymentInstruction();

            showToast("✅ অর্ডার " + orderNumber + " সফল!");

            setTimeout(() => {
                alert(
                    "✅ অর্ডার কনফার্ম হয়েছে!\n\n" +
                    "Order নম্বর: " + orderNumber + "\n\n" +
                    "📦 ডেলিভারি: " + deliveryArea + "\n" +
                    "💵 ডেলিভারি চার্জ: ৳" + deliveryCharge + " (পেইড)\n" +
                    "💰 COD তে দিতে হবে: ৳" + subtotal + "\n" +
                    "📊 মোট: ৳" + total + "\n\n" +
                    "🔍 আপনার TrxID: " + trxId + "\n\n" +
                    "ARTistico ২৪ ঘণ্টার মধ্যে যাচাই করে যোগাযোগ করবে।"
                );
            }, 300);

        } catch (err) {
            console.error("Order save error:", err);
            showToast("❌ অর্ডার জমা হয়নি। আবার চেষ্টা করুন।");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Submit order ✓";
            }
        }
    });
}

updatePaymentInstruction();
updateWishlistCount();
loadProductsFromFirebase();
renderCart();

console.log("✅ ARTistico initialized with COD + Fraud Detection");


// ============================================
// 🎬 LEVEL 2: PRODUCTS SECTION ANIMATIONS (JS)
// ============================================

(function() {
    'use strict';

    // ============================================
    // 🎯 1. PRODUCT CARD 3D TILT
    // ============================================
    function initProductCardTilt() {
        if (window.innerWidth <= 800) return;
        if ('ontouchstart' in window) return;

        document.querySelectorAll('.product-card').forEach(card => {
            let ticking = false;

            card.addEventListener('mousemove', (e) => {
                if (ticking) return;
                ticking = true;

                requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    const rotateX = ((y - centerY) / centerY) * -6;
                    const rotateY = ((x - centerX) / centerX) * 6;

                    card.style.transform = `translateY(-12px) scale(1.02) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                    ticking = false;
                });
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // ============================================
    // 🎯 2. CART BOUNCE ON ADD
    // ============================================
    function initCartBounceAnimation() {
        document.addEventListener('click', (e) => {
            const addBtn = e.target.closest('.btn-add-cart');
            if (!addBtn) return;
            if (addBtn.disabled) return;

            setTimeout(() => {
                const cartIcon = document.querySelector('.cart-icon');
                if (cartIcon) {
                    cartIcon.classList.add('bump');
                    setTimeout(() => cartIcon.classList.remove('bump'), 700);
                }

                const cartCount = document.getElementById('cartCount');
                if (cartCount) {
                    cartCount.classList.add('bounce');
                    setTimeout(() => cartCount.classList.remove('bounce'), 600);
                }
            }, 100);
        });
    }

    // ============================================
    // 🎯 3. SIZE BUTTON POP ON CLICK
    // ============================================
    function initSizeButtonPop() {
        document.addEventListener('click', (e) => {
            const sizeBtn = e.target.closest('.size-btn');
            if (!sizeBtn) return;

            sizeBtn.style.transform = 'scale(1.3) rotate(5deg)';
            setTimeout(() => {
                sizeBtn.style.transform = '';
            }, 300);
        });
    }

    // ============================================
    // 🎯 4. PRODUCT CARD ENTRANCE ANIMATION
    // ============================================
    function initProductEntrance() {
        const cards = document.querySelectorAll('.product-card');
        if (!cards.length) return;

        cards.forEach(card => {
            card.style.animation = 'none';
            card.offsetHeight;
            card.style.animation = '';
        });
    }

    // ============================================
    // 🎯 5. WISHLIST HEART ANIMATION
    // ============================================
    function initWishlistAnimation() {
        document.addEventListener('click', (e) => {
            const heart = e.target.closest('.wishlist-heart');
            if (!heart) return;

            heart.style.transform = 'scale(1.5)';
            setTimeout(() => {
                heart.style.transform = '';
            }, 400);
        });
    }

    // ============================================
    // 🎯 6. BUTTON RIPPLE EFFECT
    // ============================================
    function initButtonRipple() {
        document.addEventListener('click', (e) => {
            const button = e.target.closest('.btn-add-cart, .btn-whatsapp');
            if (!button) return;
            if (button.disabled) return;

            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: 0;
                height: 0;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: translate(-50%, -50%);
                pointer-events: none;
                animation: rippleEffect 0.7s ease-out;
                z-index: 1;
            `;

            button.appendChild(ripple);
            setTimeout(() => ripple.remove(), 700);
        });
    }

    // ============================================
    // 🎯 7. IMAGE LAZY LOAD FADE
    // ============================================
    function initImageFade() {
        const images = document.querySelectorAll('.product-image img');
        images.forEach(img => {
            if (img.complete) {
                img.style.opacity = '1';
            } else {
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.6s ease';
                img.addEventListener('load', () => {
                    img.style.opacity = '1';
                });
            }
        });
    }

    // ============================================
    // 🎯 8. RE-INIT ON NEW PRODUCTS
    // ============================================
    function reinitOnProductsLoad() {
        // Watch for new product cards
        const observer = new MutationObserver(() => {
            if (document.querySelectorAll('.product-card').length > 0) {
                initProductCardTilt();
                initImageFade();
            }
        });

        const grid = document.getElementById('productsGrid');
        if (grid) {
            observer.observe(grid, { childList: true, subtree: true });
        }
    }

    // ============================================
    // 🎯 INITIALIZE ALL
    // ============================================
    document.addEventListener('DOMContentLoaded', () => {
        initProductCardTilt();
        initCartBounceAnimation();
        initSizeButtonPop();
        initWishlistAnimation();
        initButtonRipple();
        initImageFade();
        reinitOnProductsLoad();

        console.log('🎬 Level 2: Products Animation initialized');
    });

    // Re-init after products load
    setTimeout(() => {
        initProductCardTilt();
        initImageFade();
    }, 2500);

    // Re-init after cart updates
    setTimeout(() => {
        initProductCardTilt();
    }, 5000);

})();


// ============================================
// 🎬 LEVEL 3: SCROLL REVEAL SYSTEM (JS)
// Advanced Intersection Observer
// ============================================

(function() {
    'use strict';

    // ============================================
    // 🎯 SELECTORS TO REVEAL
    // ============================================
    const REVEAL_SELECTORS = [
        // Sections
        'section',
        // Headings
        '.section-heading',
        // Trust Badges
        '.trust-badges',
        '.trust-badges .badge-item',
        // Breadcrumb
        '.breadcrumb',
        // About Features
        '.info-section .features',
        '.info-section .features article',
        // Policies
        '.policies-section .policy-grid',
        '.policies-section .policy-grid article',
        // FAQ
        '.faq-section .faq-list',
        '.faq-section .faq-list details',
        // Contact
        '.contact-section',
        '.contact-section .support-details p',
        // Footer
        '.site-footer'
    ];

    // ============================================
    // 🎯 AUTO-ASSIGN CLASSES
    // ============================================
    function autoAssignRevealClasses() {
        // Trust Badges → Stagger
        const trustBadges = document.querySelector('.trust-badges');
        if (trustBadges && !trustBadges.classList.contains('active')) {
            trustBadges.classList.add('reveal-stagger');
        }

        // About Features → Stagger
        const features = document.querySelector('.info-section .features');
        if (features && !features.classList.contains('active')) {
            features.classList.add('reveal-stagger');
        }

        // Policies Grid → Stagger
        const policyGrid = document.querySelector('.policies-section .policy-grid');
        if (policyGrid && !policyGrid.classList.contains('active')) {
            policyGrid.classList.add('reveal-stagger');
        }

        // FAQ List → Stagger
        const faqList = document.querySelector('.faq-section .faq-list');
        if (faqList && !faqList.classList.contains('active')) {
            faqList.classList.add('reveal-stagger');
        }

        // Breadcrumb
        const breadcrumb = document.querySelector('.breadcrumb');
        if (breadcrumb && !breadcrumb.classList.contains('reveal')) {
            breadcrumb.classList.add('reveal');
        }

        // Contact Section
        const contact = document.querySelector('.contact-section');
        if (contact && !contact.classList.contains('reveal')) {
            contact.classList.add('reveal');
        }

        // Footer
        const footer = document.querySelector('.site-footer');
        if (footer && !footer.classList.contains('reveal')) {
            footer.classList.add('reveal');
        }
    }

    // ============================================
    // 🎯 INTERSECTION OBSERVER
    // ============================================
    function initScrollReveal() {
        const targets = document.querySelectorAll(
            '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger, ' +
            '.trust-badges, .section-heading, .breadcrumb, .contact-section, .site-footer, ' +
            '.info-section .features, .policies-section .policy-grid, .faq-section .faq-list'
        );

        if (!targets.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -80px 0px'
        });

        targets.forEach(el => {
            if (!el.classList.contains('active')) {
                observer.observe(el);
            }
        });
    }

    // ============================================
    // 🎯 STAGGER CHILDREN
    // ============================================
    function initStaggerChildren() {
        const staggerContainers = document.querySelectorAll('.stagger-children');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15
        });

        staggerContainers.forEach(el => observer.observe(el));
    }

    // ============================================
    // 🎯 REVEAL ON PAGE LOAD (Above Fold)
    // ============================================
    function revealAboveFold() {
        const aboveFold = document.querySelectorAll('.hero, .trust-badges, .breadcrumb');

        setTimeout(() => {
            aboveFold.forEach(el => el.classList.add('active'));
        }, 300);
    }

    // ============================================
    // 🎯 MANUAL REVEAL FOR MISSED ELEMENTS
    // ============================================
    function manualRevealCheck() {
        const windowHeight = window.innerHeight;

        document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < windowHeight * 0.85 && !el.classList.contains('active')) {
                el.classList.add('active');
            }
        });
    }

    // ============================================
    // 🎯 INIT
    // ============================================
    function init() {
        autoAssignRevealClasses();
        initScrollReveal();
        initStaggerChildren();
        revealAboveFold();

        // Check after load
        setTimeout(manualRevealCheck, 1000);
        setTimeout(manualRevealCheck, 2000);

        // On scroll check
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                manualRevealCheck();
                ticking = false;
            });
        });

        console.log('🎬 Level 3: Scroll Reveal System initialized');
    }

    // ============================================
    // 🎯 RUN
    // ============================================
    document.addEventListener('DOMContentLoaded', init);

    // Re-init after products load
    setTimeout(() => {
        autoAssignRevealClasses();
        initScrollReveal();
        manualRevealCheck();
    }, 2500);

})();


// ============================================
// 🎬 LEVEL 4: CART & CHECKOUT ANIMATIONS (JS)
// ============================================

(function() {
    'use strict';

    // ============================================
    // 🎯 1. QUANTITY BUTTON PULSE
    // ============================================
    function initQuantityPulse() {
        document.addEventListener('click', (e) => {
            const qtyBtn = e.target.closest('.quantity-btn');
            if (!qtyBtn) return;

            qtyBtn.style.transform = 'scale(1.2)';
            setTimeout(() => {
                qtyBtn.style.transform = '';
            }, 300);
        });
    }

    // ============================================
    // 🎯 2. TOTAL PRICE PULSE
    // ============================================
    function initTotalPulse() {
        let lastTotal = '';

        setInterval(() => {
            const totalEl = document.getElementById('cartTotal');
            if (!totalEl) return;

            const currentTotal = totalEl.textContent;
            if (currentTotal !== lastTotal && lastTotal !== '') {
                totalEl.classList.add('pulse');
                setTimeout(() => totalEl.classList.remove('pulse'), 600);
            }
            lastTotal = currentTotal;
        }, 500);
    }

    // ============================================
    // 🎯 3. CONFETTI CELEBRATION
    // ============================================
    function createConfetti() {
        const colors = ['#c9a961', '#d87550', '#294d3b', '#e4c989', '#ffffff'];
        const confettiCount = 50;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = (Math.random() * 8 + 6) + 'px';
            confetti.style.height = (Math.random() * 8 + 6) + 'px';
            confetti.style.animationDelay = (Math.random() * 0.5) + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';

            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 4000);
        }
    }

    // ============================================
    // 🎯 4. DETECT ORDER SUCCESS
    // ============================================
    function initOrderSuccessDetection() {
        // Watch for alert or toast with order success
        const originalAlert = window.alert;
        window.alert = function(message) {
            if (message && message.includes('অর্ডার কনফার্ম')) {
                createConfetti();
                playSuccessSound();
            }
            return originalAlert.apply(this, arguments);
        };
    }

    // ============================================
    // 🎯 5. SUCCESS SOUND (Optional)
    // ============================================
    function playSuccessSound() {
        try {
            // Simple beep using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);

            // Second beep
            setTimeout(() => {
                const osc2 = audioContext.createOscillator();
                const gain2 = audioContext.createGain();
                osc2.connect(gain2);
                gain2.connect(audioContext.destination);
                osc2.frequency.value = 1200;
                osc2.type = 'sine';
                gain2.gain.setValueAtTime(0.1, audioContext.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                osc2.start(audioContext.currentTime);
                osc2.stop(audioContext.currentTime + 0.3);
            }, 150);

        } catch (err) {
            // Silent fail
        }
    }

    // ============================================
    // 🎯 6. CART MODAL ENHANCEMENT
    // ============================================
    function initCartModalEnhancement() {
        const cartButton = document.getElementById('cartButton');
        const cartModal = document.getElementById('cartModal');

        if (cartButton && cartModal) {
            cartButton.addEventListener('click', () => {
                setTimeout(() => {
                    const items = cartModal.querySelectorAll('.cart-item');
                    items.forEach((item, index) => {
                        item.style.animation = 'none';
                        item.offsetHeight;
                        item.style.animation = `cartItemSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s forwards`;
                    });
                }, 100);
            });
        }
    }

    // ============================================
    // 🎯 7. CHECKOUT FORM REVEAL
    // ============================================
    function initCheckoutFormReveal() {
        const checkoutButton = document.getElementById('checkoutButton');
        const checkoutForm = document.getElementById('checkoutForm');

        if (checkoutButton && checkoutForm) {
            checkoutButton.addEventListener('click', () => {
                setTimeout(() => {
                    if (checkoutForm && !checkoutForm.hidden) {
                        checkoutForm.style.animation = 'none';
                        checkoutForm.offsetHeight;
                        checkoutForm.style.animation = 'checkoutFormSlideDown 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    }
                }, 50);
            });
        }
    }

    // ============================================
    // 🎯 8. PAYMENT METHOD TOGGLE
    // ============================================
    function initPaymentToggle() {
        document.querySelectorAll('input[name="payment"]').forEach(input => {
            input.addEventListener('change', () => {
                const bkashFields = document.getElementById('bkashFields');
                const nagadFields = document.getElementById('nagadFields');

                if (bkashFields && input.value === 'bKash') {
                    bkashFields.style.animation = 'none';
                    bkashFields.offsetHeight;
                    bkashFields.style.animation = 'paymentFieldSlideDown 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                }

                if (nagadFields && input.value === 'Nagad') {
                    nagadFields.style.animation = 'none';
                    nagadFields.offsetHeight;
                    nagadFields.style.animation = 'paymentFieldSlideDown 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                }
            });
        });
    }

    // ============================================
    // 🎯 9. REMOVE ITEM ANIMATION
    // ============================================
    function initRemoveAnimation() {
        document.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.remove-btn');
            if (!removeBtn) return;

            const cartItem = removeBtn.closest('.cart-item');
            if (cartItem) {
                cartItem.style.transition = 'all 0.4s ease';
                cartItem.style.opacity = '0';
                cartItem.style.transform = 'translateX(100px)';
                setTimeout(() => {
                    cartItem.style.opacity = '';
                    cartItem.style.transform = '';
                }, 400);
            }
        });
    }

    // ============================================
    // 🎯 10. INIT
    // ============================================
    document.addEventListener('DOMContentLoaded', () => {
        initQuantityPulse();
        initTotalPulse();
        initOrderSuccessDetection();
        initCartModalEnhancement();
        initCheckoutFormReveal();
        initPaymentToggle();
        initRemoveAnimation();

        console.log('🎬 Level 4: Cart & Checkout Animation initialized');
    });

    // Make confetti available globally
    window.triggerConfetti = createConfetti;

})();


// ===== LEVEL 5 =====
(function () {
    'use strict';

    // 1. Custom Cursor
    function initCursor() {
        if (!matchMedia('(hover: hover)').matches) return;
        const dot = document.createElement('div');
        const ring = document.createElement('div');
        dot.className = 'cursor-dot';
        ring.className = 'cursor-ring';
        document.body.append(dot, ring);
        document.body.classList.add('has-cursor');

        let x = 0, y = 0, rx = 0, ry = 0;
        document.addEventListener('mousemove', e => {
            x = e.clientX; y = e.clientY;
            dot.style.transform = `translate(${x}px, ${y}px)`;
        });
        (function loop() {
            rx += (x - rx) * 0.15;
            ry += (y - ry) * 0.15;
            ring.style.transform = `translate(${rx}px, ${ry}px)`;
            requestAnimationFrame(loop);
        })();
        document.addEventListener('mouseover', e => {
            ring.classList.toggle('hover', !!e.target.closest('a, button, .product-card'));
        });
    }

    // 2. Button Ripple
    function initRipple() {
        document.addEventListener('click', e => {
            const btn = e.target.closest('button, .btn');
            if (!btn) return;
            if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
            btn.style.overflow = 'hidden';
            const r = btn.getBoundingClientRect();
            const size = Math.max(r.width, r.height);
            const s = document.createElement('span');
            s.className = 'ripple-span';
            s.style.width = s.style.height = size + 'px';
            s.style.left = (e.clientX - r.left - size / 2) + 'px';
            s.style.top = (e.clientY - r.top - size / 2) + 'px';
            btn.appendChild(s);
            setTimeout(() => s.remove(), 600);
        });
    }

    // 3. Lazy Fade + Skeleton (পরে Firestore থেকে আসা ছবিতেও কাজ করবে)
    function prepImg(img) {
        if (img.dataset.fade) return;
        img.dataset.fade = '1';
        img.loading = 'lazy';
        if (img.complete && img.naturalWidth) return;
        const box = img.parentElement;
        img.classList.add('fade-img');
        box.classList.add('skeleton');
        const done = () => {
            img.classList.add('loaded');
            box.classList.remove('skeleton');
        };
        img.addEventListener('load', done);
        img.addEventListener('error', done);
    }
    function initImages() {
        document.querySelectorAll('img').forEach(prepImg);
        new MutationObserver(muts => {
            muts.forEach(m => m.addedNodes.forEach(n => {
                if (n.nodeType !== 1) return;
                if (n.tagName === 'IMG') prepImg(n);
                else n.querySelectorAll && n.querySelectorAll('img').forEach(prepImg);
            }));
        }).observe(document.body, { childList: true, subtree: true });
    }

    // 4. Scroll Progress + Back to Top
    function initScroll() {
        const bar = document.createElement('div');
        bar.id = 'scrollProgress';
        const top = document.createElement('button');
        top.id = 'backToTop';
        top.setAttribute('aria-label', 'Back to top');
        top.textContent = '↑';
        document.body.append(bar, top);

        top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        window.addEventListener('scroll', () => {
            const h = document.documentElement.scrollHeight - innerHeight;
            bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
            top.classList.toggle('show', scrollY > 400);
        }, { passive: true });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initCursor(); initRipple(); initImages(); initScroll();
    });
})();
