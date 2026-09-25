// =============================================
// 🔥 Firebase থেকে প্রোডাক্ট লোড
// =============================================
let products = [];

const FIREBASE_URL = "https://artistico-c3a5e-default-rtdb.asia-southeast1.firebasedatabase.app";
const WHATSAPP_NUMBER = "8801636032218";

async function loadProductsFromFirebase() {
    try {
        showLoadingSkeleton();
        const res = await fetch(`${FIREBASE_URL}/Products.json`);
        const data = await res.json();
        if (data) {
            products = Object.values(data).filter(p => p && p.name && p.id);
            renderProducts();
        } else {
            console.warn("Firebase-এ কোনো প্রোডাক্ট নেই");
        }
    } catch (err) {
        console.error("প্রোডাক্ট লোড হয়নি:", err);
    }
}

let cart = [];
let selectedCategory = "all";

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
const themeIcon = darkModeToggle?.querySelector(".theme-icon");
const liveChatButton = document.getElementById("liveChatButton");
const breadcrumbCurrent = document.getElementById("breadcrumbCurrent");

const bkashMerchantNumber = "01636032218";
const nagadMerchantNumber = "01636032218";

function money(value) {
    return `৳${Number(value).toLocaleString("en-BD")}`;
}

function getSelectedDeliveryInput() {
    return document.querySelector('input[name="delivery"]:checked');
}

function getSelectedDelivery() {
    return Number(getSelectedDeliveryInput()?.value || 0);
}

function getDeliveryArea() {
    return getSelectedDeliveryInput()?.value === "120"
        ? "ঢাকার বাইরে"
        : "ঢাকার ভিতরে";
}

function getSelectedPayment() {
    return document.querySelector('input[name="payment"]:checked')?.value || "Visa";
}

function getSubtotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// ✅ Size Chart Modal
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

// ✅ Loading Skeleton
function showLoadingSkeleton() {
    if (!productsGrid) return;
    const skeletonCount = 6;
    let skeletonHTML = "";
    for (let i = 0; i < skeletonCount; i++) {
        skeletonHTML += `
            <article class="product-card skeleton-card">
                <div class="product-image skeleton-image"></div>
                <div class="product-info">
                    <div class="skeleton-line skeleton-small"></div>
                    <div class="skeleton-line skeleton-medium"></div>
                    <div class="skeleton-line skeleton-large"></div>
                    <div class="skeleton-line skeleton-small"></div>
                    <div class="skeleton-line skeleton-button"></div>
                </div>
            </article>
        `;
    }
    productsGrid.innerHTML = skeletonHTML;
}

// ✅ Breadcrumb
function updateBreadcrumb(categoryName) {
    if (!breadcrumbCurrent) return;
    if (!categoryName || categoryName === "all") {
        breadcrumbCurrent.textContent = "All Products";
    } else {
        const labels = {
            mens: "Men's",
            womens: "Women's",
            boys: "Boys",
            unisex: "Unisex"
        };
        breadcrumbCurrent.textContent = labels[categoryName] || categoryName;
    }
}

function renderProducts() {
    if (!productsGrid) return;

    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";

    const filteredProducts = products.filter(product => {
        const matchesCategory =
            selectedCategory === "all" || product.category === selectedCategory;

        const matchesSearch =
            (product.name || "").toLowerCase().includes(searchTerm) ||
            (product.description || "").toLowerCase().includes(searchTerm);

        return matchesCategory && matchesSearch;
    });

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `<p class="empty-cart">কোনো শার্ট পাওয়া যায়নি।</p>`;
        return;
    }

    productsGrid.innerHTML = filteredProducts.map(product => {
        const stock = product.stock !== undefined ? Number(product.stock) : 10;
        const isOutOfStock = stock <= 0;
        const productName = product.name || "Product";
        const whatsappMsg = encodeURIComponent(`আসসালামু আলাইকুম, আমি "${productName}" (৳${product.price}) সম্পর্কে জানতে চাই।`);
        const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`;
        const shareMsg = encodeURIComponent(`ARTistico-তে দেখুন: ${productName} — ৳${product.price}`);
        const shareUrl = encodeURIComponent("https://artisticooutfit.vercel.app");

        return `
        <article class="product-card">
            <div class="product-image">
                <span class="product-badge">থ্রিফটেড</span>
                ${isOutOfStock ? '<span class="stock-badge">STOCK OUT</span>' : ''}
                <img src="${product.image}" alt="${productName}" loading="lazy"
                     onerror="this.src='https://placehold.co/600x600/e0f7ff/003d7a?text=ARTistico'">
                
                <!-- ✅ Social Share -->
                <div class="share-buttons">
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" 
                       target="_blank" class="share-btn share-fb" title="Share on Facebook" aria-label="Share on Facebook">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                    </a>
                    <a href="https://wa.me/?text=${shareMsg}%20${shareUrl}" 
                       target="_blank" class="share-btn share-wa" title="Share on WhatsApp" aria-label="Share on WhatsApp">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                    </a>
                </div>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${productName}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${money(product.price)}</div>

                <div class="size-selector">
                    ${(product.sizes || ["M", "L", "XL"]).map((size, index) => `
                        <button type="button"
                                class="size-btn ${index === 0 ? "selected" : ""}"
                                data-product="${product.id}"
                                data-size="${size}">
                            ${size}
                        </button>
                    `).join("")}
                </div>

                <button type="button" class="btn-size-guide" onclick="openSizeChart()">
                    📏 Size Guide
                </button>

                <button type="button" 
                        class="btn-add-cart ${isOutOfStock ? "disabled" : ""}" 
                        data-product="${product.id}"
                        ${isOutOfStock ? "disabled" : ""}>
                    ${isOutOfStock ? "স্টক শেষ" : "কার্টে যোগ করুন"}
                </button>

                <a href="${whatsappLink}" target="_blank" class="btn-whatsapp">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    WhatsApp-এ জিজ্ঞেস করুন
                </a>
            </div>
        </article>
    `;
    }).join("");
}

function renderCart() {
    if (!cartCount) return;

    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (cart.length === 0) {
        if (cartItems) cartItems.innerHTML = `<div class="empty-cart">আপনার কার্ট খালি।</div>`;
        if (cartSubtotal) cartSubtotal.textContent = money(0);
        if (deliveryCost) deliveryCost.textContent = money(0);
        if (cartTotal) cartTotal.textContent = money(0);
        if (checkoutForm) checkoutForm.hidden = true;
        return;
    }

    if (cartItems) {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div>
                    <h3>${item.name}</h3>
                    <p>${money(item.price)} · সাইজ ${item.size}</p>
                </div>
                <div class="quantity-control">
                    <button type="button" class="quantity-btn"
                            data-action="decrease" data-id="${item.cartId}">−</button>
                    <span>${item.quantity}</span>
                    <button type="button" class="quantity-btn"
                            data-action="increase" data-id="${item.cartId}">+</button>
                    <button type="button" class="remove-btn"
                            data-action="remove" data-id="${item.cartId}">রিমুভ</button>
                </div>
            </div>
        `).join("");
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

    const bkashFields = document.getElementById('bkashFields');
    const nagadFields = document.getElementById('nagadFields');

    if (bkashFields) bkashFields.style.display = 'none';
    if (nagadFields) nagadFields.style.display = 'none';

    if (!paymentInstruction) return;

    if (payment === 'Visa') {
        paymentInstruction.textContent = "ভিসা পেমেন্টের জন্য একটি সুরক্ষিত গেটওয়ে প্রয়োজন। এখানে কার্ডের তথ্য দেবেন না।";
    } else if (payment === 'bKash') {
        if (bkashFields) bkashFields.style.display = 'block';
        paymentInstruction.textContent = `মোট টাকা বিকাশ নম্বরে পাঠান: ${bkashMerchantNumber}। তারপর আপনার সেন্ডার নম্বর ও TrxID দিন।`;
    } else if (payment === 'Nagad') {
        if (nagadFields) nagadFields.style.display = 'block';
        paymentInstruction.textContent = `মোট টাকা নগদ নম্বরে পাঠান: ${nagadMerchantNumber}। তারপর আপনার সেন্ডার নম্বর ও TrxID দিন।`;
    }
}

function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
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

// Product card এ ক্লিক করলে size এবং add to cart handle
if (productsGrid) {
    productsGrid.addEventListener("click", event => {
        const sizeButton = event.target.closest(".size-btn");

        if (sizeButton) {
            const productId = sizeButton.dataset.product;

            document
                .querySelectorAll(`.size-btn[data-product="${productId}"]`)
                .forEach(button => button.classList.remove("selected"));

            sizeButton.classList.add("selected");
            return;
        }

        const addButton = event.target.closest(".btn-add-cart");
        if (!addButton) return;
        if (addButton.disabled) return;

        const product = products.find(
            item => item.id === Number(addButton.dataset.product)
        );

        if (!product) return;

        const selectedSizeButton = document.querySelector(
            `.size-btn[data-product="${product.id}"].selected`
        );

        const sizes = product.sizes || ["M", "L", "XL"];
        const selectedSize = selectedSizeButton?.dataset.size || sizes[0];
        const cartId = `${product.id}-${selectedSize}`;
        const existingItem = cart.find(item => item.cartId === cartId);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                cartId,
                id: product.id,
                name: product.name,
                price: product.price,
                size: selectedSize,
                quantity: 1
            });
        }

        renderCart();
        bumpCartIcon();
        showToast(`${product.name} কার্টে যোগ হয়েছে`);
    });
}

function bumpCartIcon() {
    if (!cartButton) return;
    cartButton.classList.add("bump");
    setTimeout(() => cartButton.classList.remove("bump"), 600);
}

if (cartItems) {
    cartItems.addEventListener("click", event => {
        const button = event.target.closest("button");
        if (!button) return;

        const item = cart.find(entry => entry.cartId === button.dataset.id);
        if (!item) return;

        if (button.dataset.action === "increase") item.quantity++;
        if (button.dataset.action === "decrease") item.quantity--;
        if (button.dataset.action === "remove") item.quantity = 0;

        cart = cart.filter(entry => entry.quantity > 0);
        renderCart();
    });
}

document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelector(".filter-btn.active")?.classList.remove("active");
        button.classList.add("active");
        selectedCategory = button.dataset.category;
        updateBreadcrumb(selectedCategory);
        renderProducts();
    });
});

document.querySelectorAll('input[name="delivery"]').forEach(input => {
    input.addEventListener("change", updateTotals);
});

document.querySelectorAll('input[name="payment"]').forEach(input => {
    input.addEventListener("change", updatePaymentInstruction);
});

if (searchInput) {
    searchInput.addEventListener("input", () => {
        const term = searchInput.value.trim();
        if (breadcrumbCurrent) {
            if (term) {
                breadcrumbCurrent.textContent = `Search: "${term}"`;
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
        if (event.target === cartModal) {
            closeCart();
        }
    });
}

if (closeSizeChart) {
    closeSizeChart.addEventListener("click", closeSizeChartModal);
}

if (sizeChartModal) {
    sizeChartModal.addEventListener("click", event => {
        if (event.target === sizeChartModal) {
            closeSizeChartModal();
        }
    });
}

if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
        if (cart.length === 0) {
            showToast("কার্টে একটি প্রোডাক্ট যোগ করুন।");
            return;
        }

        checkoutForm.hidden = false;
        checkoutForm.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

        updatePaymentInstruction();
    });
}

// =============================================
// ✨ DARK MODE
// =============================================
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

// =============================================
// ✨ LIVE CHAT
// =============================================
if (liveChatButton) {
    liveChatButton.addEventListener("click", () => {
        const msg = encodeURIComponent("আসসালামু আলাইকুম, ARTistico থেকে সহায়তা চাই।");
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
    });
}

// =============================================
// 📝 ORDER SUBMIT
// =============================================
if (checkoutForm) {
    checkoutForm.addEventListener("submit", event => {
        event.preventDefault();

        const payment = getSelectedPayment();

        if (payment === 'bKash') {
            const sender = document.getElementById('bkashSender')?.value.trim();
            const trx = document.getElementById('bkashTransactionId')?.value.trim();

            if (!sender || sender.length < 11) {
                showToast('সঠিক বিকাশ সেন্ডার নম্বর দিন (০১XXXXXXXXX)');
                return;
            }
            if (!trx || trx.length < 6) {
                showToast('সঠিক TrxID দিন (ন্যূনতম ৬ অক্ষর)');
                return;
            }
        }

        if (payment === 'Nagad') {
            const sender = document.getElementById('nagadSender')?.value.trim();
            const trx = document.getElementById('nagadTransactionId')?.value.trim();

            if (!sender || sender.length < 11) {
                showToast('সঠিক নগদ সেন্ডার নম্বর দিন (০১XXXXXXXXX)');
                return;
            }
            if (!trx || trx.length < 6) {
                showToast('সঠিক TrxID দিন (ন্যূনতম ৬ অক্ষর)');
                return;
            }
        }

        if (cart.length === 0) {
            showToast("আপনার কার্ট খালি।");
            checkoutForm.hidden = true;
            return;
        }

        if (!checkoutForm.checkValidity()) {
            checkoutForm.reportValidity();
            return;
        }

        const formData = new FormData(checkoutForm);
        const deliveryCharge = getSelectedDelivery();
        const subtotal = getSubtotal();
        const total = subtotal + deliveryCharge;
        const orderNumber = `ART-${Date.now().toString().slice(-6)}`;

        let senderNumber = 'N/A';
        let trxId = 'N/A';

        if (payment === 'bKash') {
            senderNumber = formData.get('bkashSender') || 'N/A';
            trxId = formData.get('bkashTransactionId') || 'N/A';
        } else if (payment === 'Nagad') {
            senderNumber = formData.get('nagadSender') || 'N/A';
            trxId = formData.get('nagadTransactionId') || 'N/A';
        }

        const order = {
            orderNumber,
            customer: {
                name: formData.get("customerName"),
                phone: formData.get("customerPhone"),
                email: formData.get("customerEmail"),
                address: formData.get("customerAddress")
            },
            delivery: {
                area: getDeliveryArea(),
                charge: deliveryCharge
            },
            payment,
            subtotal,
            total,
            items: cart.map(item => ({
                name: item.name,
                size: item.size,
                quantity: item.quantity,
                price: item.price
            })),
            senderNumber: senderNumber,
            trxId: trxId,
            status: payment === 'Visa' ? 'pending' : 'pending_verification',
            createdAt: new Date().toISOString()
        };

        const orders = JSON.parse(localStorage.getItem('artisticoOrders') || '[]');
        orders.push({
            orderId: order.orderNumber,
            customer: order.customer.name,
            phone: order.customer.phone,
            address: order.customer.address,
            payment: order.payment,
            items: order.items.map(i => `${i.name} (${i.size}) x${i.quantity}`).join(', '),
            total: order.total,
            senderNumber: order.senderNumber,
            trxId: order.trxId,
            status: 'pending'
        });
        localStorage.setItem('artisticoOrders', JSON.stringify(orders));

        fetch(`${FIREBASE_URL}/Orders.json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderNumber: order.orderNumber,
                customer: order.customer,
                delivery: order.delivery,
                items: order.items,
                payment: order.payment,
                subtotal: order.subtotal,
                total: order.total,
                senderNumber: order.senderNumber,
                trxId: order.trxId,
                status: 'pending',
                createdAt: order.createdAt
            })
        }).then(() => console.log('✅ অর্ডার Firebase-এ গেছে'))
          .catch(err => console.error('❌ Firebase error:', err));

        localStorage.setItem("artisticoLastOrder", JSON.stringify(order));

        checkoutForm.reset();
        checkoutForm.hidden = true;
        cart = [];
        renderCart();
        updatePaymentInstruction();

        showToast(`অর্ডার ${orderNumber} সফলভাবে জমা হয়েছে।`);

        setTimeout(() => {
            const paymentMessage = payment !== 'Visa'
                ? `সেন্ডার নম্বর: ${order.senderNumber}\nTrxID: ${order.trxId}\n`
                : '';

            alert(
                `আপনার অর্ডারের জন্য ধন্যবাদ!\n\n` +
                `অর্ডার নম্বর: ${orderNumber}\n` +
                `ডেলিভারি এলাকা: ${order.delivery.area}\n` +
                `ডেলিভারি ঠিকানা: ${order.customer.address}\n` +
                paymentMessage +
                `মোট: ${money(total)}\n\n` +
                `ARTistico আপনার অর্ডার যাচাই করবে এবং ডেলিভারির জন্য যোগাযোগ করবে।`
            );
        }, 300);
    });
}

// =============================================
// 🚀 START
// =============================================
updatePaymentInstruction();
loadProductsFromFirebase();
renderCart();

console.log("✅ ARTistico initialized with Dark Mode, Breadcrumb, Live Chat, Social Share, Skeleton Loading");
