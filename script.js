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

// ✅ CHECKOUT SUBMIT (Fixed: formData → document.getElementById)
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

        // ✅ FIXED: formData এর বদলে সরাসরি element থেকে পড়ি
        const senderField = payment === 'bKash' ? 'bkashSender' : 'nagadSender';
        const trxField = payment === 'bKash' ? 'bkashTransactionId' : 'nagadTransactionId';

        const senderEl = document.getElementById(senderField);
        const trxEl = document.getElementById(trxField);
        const senderNumber = senderEl ? senderEl.value.trim() : "";
        const trxId = trxEl ? trxEl.value.trim().toUpperCase() : "";

        // Fraud Check 1: Sender format
        if (!senderNumber || senderNumber.length !== 11 || !/^01[3-9]\d{8}$/.test(senderNumber)) {
            showToast("❌ সঠিক ১১ ডিজিটের নম্বর দিন (01XXXXXXXXX)");
            return;
        }

        // Fraud Check 2: TrxID format
        if (!trxId || trxId.length < 8) {
            showToast("❌ TrxID কমপক্ষে ৮ অক্ষরের হতে হবে");
            return;
        }

        if (!/^[A-Z0-9]+$/.test(trxId)) {
            showToast("❌ TrxID-এ শুধু A-Z ও 0-9 থাকবে");
            return;
        }

        // Fraud Check 3: Duplicate TrxID
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


/* ============================================
   🎬 PROFESSIONAL CINEMATIC ANIMATIONS
   Premium Level · Apple Quality
   ============================================ */

/* ============================================
   🎯 SCROLL REVEAL ANIMATIONS
   ============================================ */
.reveal {
    opacity: 0;
    transform: translateY(60px);
    transition: all 1s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.reveal.active {
    opacity: 1;
    transform: translateY(0);
}

.reveal-left {
    opacity: 0;
    transform: translateX(-80px);
    transition: all 1s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.reveal-left.active {
    opacity: 1;
    transform: translateX(0);
}

.reveal-right {
    opacity: 0;
    transform: translateX(80px);
    transition: all 1s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.reveal-right.active {
    opacity: 1;
    transform: translateX(0);
}

.reveal-scale {
    opacity: 0;
    transform: scale(0.85);
    transition: all 1s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.reveal-scale.active {
    opacity: 1;
    transform: scale(1);
}

/* ============================================
   🎯 HERO SECTION — TYPING + FADE
   ============================================ */
.hero h1 {
    position: relative;
    overflow: hidden;
}

.hero h1 em {
    display: inline-block;
    position: relative;
    background: linear-gradient(90deg, #294d3b 0%, #4a7c5d 50%, #294d3b 100%);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: heroGradientShift 4s ease infinite;
}

@keyframes heroGradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
}

.hero .eyebrow {
    animation: heroFadeUp 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
}

.hero h1 {
    animation: heroFadeUp 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s both;
}

.hero-text {
    animation: heroFadeUp 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.7s both;
}

.hero .cta-button {
    animation: heroFadeUp 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.9s both;
}

@keyframes heroFadeUp {
    from {
        opacity: 0;
        transform: translateY(50px);
        filter: blur(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
        filter: blur(0);
    }
}

/* Hero Badge — Rotate Floating */
.hero-badge {
    animation: heroBadgeFloat 4s ease-in-out infinite;
}

@keyframes heroBadgeFloat {
    0%, 100% {
        transform: translateY(0) rotate(-5deg);
    }
    50% {
        transform: translateY(-15px) rotate(5deg);
    }
}

/* ============================================
   🎯 PRODUCT CARDS — 3D TILT + STAGGER
   ============================================ */
.product-card {
    position: relative;
    transform-style: preserve-3d;
    perspective: 1000px;
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.product-card:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow: 
        0 30px 60px rgba(41, 77, 59, 0.15),
        0 15px 30px rgba(41, 77, 59, 0.08);
}

/* Card Entrance — Stagger */
.product-card {
    opacity: 0;
    animation: cardEntrancePremium 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.product-card:nth-child(1) { animation-delay: 0.05s; }
.product-card:nth-child(2) { animation-delay: 0.1s; }
.product-card:nth-child(3) { animation-delay: 0.15s; }
.product-card:nth-child(4) { animation-delay: 0.2s; }
.product-card:nth-child(5) { animation-delay: 0.25s; }
.product-card:nth-child(6) { animation-delay: 0.3s; }
.product-card:nth-child(7) { animation-delay: 0.35s; }
.product-card:nth-child(8) { animation-delay: 0.4s; }
.product-card:nth-child(9) { animation-delay: 0.45s; }
.product-card:nth-child(10) { animation-delay: 0.5s; }

@keyframes cardEntrancePremium {
    0% {
        opacity: 0;
        transform: translateY(80px) scale(0.9) rotateX(-15deg);
        filter: blur(10px);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1) rotateX(0);
        filter: blur(0);
    }
}

/* Product Image Zoom */
.product-image {
    overflow: hidden;
    position: relative;
}

.product-image::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
        135deg,
        transparent 0%,
        rgba(201, 169, 97, 0.15) 50%,
        transparent 100%
    );
    opacity: 0;
    transition: opacity 0.5s ease;
    pointer-events: none;
}

.product-card:hover .product-image::after {
    opacity: 1;
}

.product-image img {
    transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.product-card:hover .product-image img {
    transform: scale(1.12);
}

/* Product Badge Shimmer */
.product-badge {
    position: relative;
    overflow: hidden;
    animation: badgeFloat 3s ease-in-out infinite;
}

.product-badge::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.6),
        transparent
    );
    animation: badgeShimmer 3s infinite;
}

@keyframes badgeFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
}

@keyframes badgeShimmer {
    0% { left: -100%; }
    50% { left: 100%; }
    100% { left: 100%; }
}

/* Product Price Shine */
.product-price {
    position: relative;
    background: linear-gradient(
        90deg,
        #17231f 0%,
        #d87550 25%,
        #17231f 50%,
        #d87550 75%,
        #17231f 100%
    );
    background-size: 200% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: priceShine 4s linear infinite;
}

@keyframes priceShine {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
}

/* ============================================
   🎯 BUTTONS — RIPPLE + PULSE
   ============================================ */
.btn-add-cart,
.cta-button,
.checkout-button,
.review-submit,
.track-button {
    position: relative;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-add-cart::before,
.cta-button::before,
.checkout-button::before,
.review-submit::before,
.track-button::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s ease, height 0.6s ease;
}

.btn-add-cart:hover::before,
.cta-button:hover::before,
.checkout-button:hover::before,
.review-submit:hover::before,
.track-button:hover::before {
    width: 400px;
    height: 400px;
}

.btn-add-cart:hover,
.cta-button:hover,
.checkout-button:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 12px 30px rgba(41, 77, 59, 0.25);
}

.btn-add-cart:active,
.cta-button:active,
.checkout-button:active {
    transform: translateY(-1px) scale(0.98);
}

/* Size Buttons — Pop */
.size-btn {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.size-btn:hover {
    transform: scale(1.15);
}

.size-btn.selected {
    animation: sizePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes sizePop {
    0% { transform: scale(1); }
    50% { transform: scale(1.25); }
    100% { transform: scale(1); }
}

/* ============================================
   🎯 CART — BOUNCE + QUANTITY PULSE
   ============================================ */
.cart-icon.bump {
    animation: cartBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes cartBounce {
    0%, 100% { transform: scale(1) rotate(0deg); }
    25% { transform: scale(1.3) rotate(-15deg); }
    50% { transform: scale(1.2) rotate(15deg); }
    75% { transform: scale(1.3) rotate(-5deg); }
}

.cart-count {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cart-count.bounce {
    animation: badgeBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes badgeBounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.5); }
}

.quantity-btn {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.quantity-btn:active {
    transform: scale(0.85);
    background: var(--accent);
    color: white;
}

/* ============================================
   🎯 NAVBAR — SLIDE DOWN + LINK UNDERLINE
   ============================================ */
.navbar {
    animation: navbarSlideDown 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes navbarSlideDown {
    from {
        transform: translateY(-100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.nav-link {
    position: relative;
    transition: color 0.3s ease;
}

.nav-link::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #294d3b, #d87550);
    transform: translateX(-50%);
    transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.nav-link:hover::after,
.nav-link.active::after {
    width: 100%;
}

/* Logo Hover */
.logo {
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.logo:hover {
    transform: scale(1.05) rotate(-2deg);
}

/* Search Box — Focus Glow */
.search-box {
    transition: all 0.4s ease;
}

.search-box:focus-within {
    border-bottom-color: var(--accent);
    box-shadow: 0 4px 12px rgba(216, 117, 80, 0.2);
}

/* ============================================
   🎯 SECTION HEADINGS — REVEAL
   ============================================ */
.section-heading {
    animation: sectionReveal 1s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes sectionReveal {
    from {
        opacity: 0;
        transform: translateY(40px);
        filter: blur(8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
        filter: blur(0);
    }
}

.section-title {
    position: relative;
    display: inline-block;
}

.section-title::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 0;
    height: 3px;
    background: linear-gradient(90deg, #294d3b, #d87550);
    animation: titleUnderline 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s forwards;
}

@keyframes titleUnderline {
    to { width: 60px; }
}

/* ============================================
   🎯 TRUST BADGES — STAGGER
   ============================================ */
.badge-item {
    animation: badgeReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    transition: transform 0.4s ease;
}

.badge-item:hover {
    transform: translateY(-8px) scale(1.05);
}

.badge-icon {
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.badge-item:hover .badge-icon {
    transform: scale(1.2) rotate(10deg);
}

@keyframes badgeReveal {
    from {
        opacity: 0;
        transform: translateY(40px) scale(0.8);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.badge-item:nth-child(1) { animation-delay: 0.1s; }
.badge-item:nth-child(2) { animation-delay: 0.2s; }
.badge-item:nth-child(3) { animation-delay: 0.3s; }
.badge-item:nth-child(4) { animation-delay: 0.4s; }

/* ============================================
   🎯 FAQ — SMOOTH EXPAND
   ============================================ */
.faq-item {
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.faq-item:hover {
    transform: translateX(8px);
    box-shadow: 0 8px 24px rgba(41, 77, 59, 0.1);
}

.faq-item[open] {
    background: #f8faf8;
}

.faq-item summary {
    transition: all 0.3s ease;
}

.faq-item summary:hover {
    padding-left: 28px;
}

/* ============================================
   🎯 WHATSAPP + CHATBOT — FLOATING
   ============================================ */
.whatsapp-float {
    animation: whatsappBounce 3s ease-in-out infinite;
}

@keyframes whatsappBounce {
    0%, 100% {
        transform: translateY(0);
        box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
    }
    50% {
        transform: translateY(-10px);
        box-shadow: 0 12px 30px rgba(37, 211, 102, 0.6);
    }
}

.chatbot-toggle {
    animation: chatbotBounce 3s ease-in-out infinite 0.5s;
}

@keyframes chatbotBounce {
    0%, 100% {
        transform: translateY(0);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 0 rgba(201, 169, 97, 0.7);
    }
    50% {
        transform: translateY(-8px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 12px rgba(201, 169, 97, 0);
    }
}

/* ============================================
   🎯 MODAL — SLIDE UP
   ============================================ */
.modal.active .modal-content {
    animation: modalSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalSlideUp {
    from {
        opacity: 0;
        transform: translateY(60px) scale(0.9);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* ============================================
   🎯 TOAST — SLIDE DOWN + CHECKMARK
   ============================================ */
.toast.show {
    animation: toastSlide 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes toastSlide {
    from {
        opacity: 0;
        transform: translate(-50%, -20px);
    }
    to {
        opacity: 1;
        transform: translate(-50%, 0);
    }
}

.toast.show::after {
    content: '✓';
    display: inline-block;
    margin-left: 10px;
    font-weight: 800;
    animation: checkmarkPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes checkmarkPop {
    0% { transform: scale(0) rotate(-45deg); opacity: 0; }
    50% { transform: scale(1.3) rotate(-45deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

/* ============================================
   🎯 SKELETON — SHIMMER
   ============================================ */
.skeleton-image,
.skeleton-line {
    background: linear-gradient(
        90deg,
        #e7ece7 0%,
        #dce8df 50%,
        #e7ece7 100%
    );
    background-size: 200% 100%;
    animation: skeletonShimmer 1.5s linear infinite;
}

@keyframes skeletonShimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

/* ============================================
   🎯 CUSTOM CURSOR
   ============================================ */
.custom-cursor {
    position: fixed;
    width: 20px;
    height: 20px;
    border: 2px solid #c9a961;
    border-radius: 50%;
    pointer-events: none;
    z-index: 99999;
    transition: transform 0.15s ease, width 0.3s ease, height 0.3s ease, background 0.3s ease;
    mix-blend-mode: difference;
}

.custom-cursor.hover {
    width: 60px;
    height: 60px;
    background: rgba(201, 169, 97, 0.2);
    border-color: #d87550;
}

/* Hide on mobile */
@media (max-width: 800px) {
    .custom-cursor {
        display: none !important;
    }
}

/* ============================================
   🎯 LOADING SCREEN FADE OUT
   ============================================ */
body {
    animation: bodyFadeIn 0.8s ease-out;
}

@keyframes bodyFadeIn {
    from {
        opacity: 0;
        filter: blur(5px);
    }
    to {
        opacity: 1;
        filter: blur(0);
    }
}

/* ============================================
   🎯 IMAGE REVEAL ON LOAD
   ============================================ */
.product-image img {
    animation: imageReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes imageReveal {
    from {
        opacity: 0;
        filter: blur(15px);
        transform: scale(1.1);
    }
    to {
        opacity: 1;
        filter: blur(0);
        transform: scale(1);
    }
}

/* ============================================
   🎯 PARALLAX HERO BACKGROUND
   ============================================ */
.hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
        circle at 30% 50%,
        rgba(201, 169, 97, 0.1) 0%,
        transparent 50%
    );
    animation: heroParallax 20s ease-in-out infinite;
    pointer-events: none;
}

@keyframes heroParallax {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(30px, -30px) scale(1.1); }
}

/* ============================================
   🎯 MOBILE REDUCED MOTION
   ============================================ */
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

/* ============================================
   🎯 MOBILE OPTIMIZATION
   ============================================ */
@media (max-width: 560px) {
    .hero h1 {
        letter-spacing: -1.5px;
    }

    .product-card:hover {
        transform: translateY(-6px) scale(1.01);
    }

    .btn-add-cart:hover,
    .cta-button:hover {
        transform: translateY(-2px) scale(1.01);
    }
}
