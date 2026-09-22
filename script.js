// =============================================
// 🔥 Firebase থেকে প্রোডাক্ট লোড
// =============================================
let products = [];

const FIREBASE_URL = "https://artistico-c3a5e-default-rtdb.asia-southeast1.firebasedatabase.app";

async function loadProductsFromFirebase() {
    try {
        const res = await fetch(`${FIREBASE_URL}/Products.json`);
        const data = await res.json();
        if (data) {
            products = Object.values(data);
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

function renderProducts() {
    const searchTerm = searchInput.value.trim().toLowerCase();

    const filteredProducts = products.filter(product => {
        const matchesCategory =
            selectedCategory === "all" || product.category === selectedCategory;

        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm);

        return matchesCategory && matchesSearch;
    });

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `<p class="empty-cart">কোনো শার্ট পাওয়া যায়নি।</p>`;
        return;
    }

    productsGrid.innerHTML = filteredProducts.map(product => `
        <article class="product-card">
            <div class="product-image">
                <span class="product-badge">থ্রিফটেড</span>
                <img src="${product.image}" alt="${product.name}"
                     onerror="this.src='https://placehold.co/600x600/e0f7ff/003d7a?text=ARTistico'">
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${money(product.price)}</div>

                <div class="size-selector">
                    ${product.sizes.map((size, index) => `
                        <button type="button"
                                class="size-btn ${index === 0 ? "selected" : ""}"
                                data-product="${product.id}"
                                data-size="${size}">
                            ${size}
                        </button>
                    `).join("")}
                </div>

                <button type="button" class="btn-add-cart" data-product="${product.id}">
                    কার্টে যোগ করুন
                </button>
            </div>
        </article>
    `).join("");
}

function renderCart() {
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (cart.length === 0) {
        cartItems.innerHTML = `<div class="empty-cart">আপনার কার্ট খালি।</div>`;
        cartSubtotal.textContent = money(0);
        deliveryCost.textContent = money(0);
        cartTotal.textContent = money(0);
        checkoutForm.hidden = true;
        return;
    }

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

    updateTotals();
}

function updateTotals() {
    const subtotal = getSubtotal();
    const delivery = cart.length ? getSelectedDelivery() : 0;

    cartSubtotal.textContent = money(subtotal);
    deliveryCost.textContent = money(delivery);
    cartTotal.textContent = money(subtotal + delivery);
}

function updatePaymentInstruction() {
    const payment = getSelectedPayment();

    const bkashFields = document.getElementById('bkashFields');
    const nagadFields = document.getElementById('nagadFields');

    if (bkashFields) bkashFields.style.display = 'none';
    if (nagadFields) nagadFields.style.display = 'none';

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
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

function openCart() {
    cartModal.classList.add("active");
    cartModal.setAttribute("aria-hidden", "false");
    renderCart();
    updatePaymentInstruction();
}

function closeCart() {
    cartModal.classList.remove("active");
    cartModal.setAttribute("aria-hidden", "true");
}

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

    const product = products.find(
        item => item.id === Number(addButton.dataset.product)
    );

    if (!product) return;

    const selectedSizeButton = document.querySelector(
        `.size-btn[data-product="${product.id}"].selected`
    );

    const selectedSize = selectedSizeButton?.dataset.size || product.sizes[0];
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
    showToast(`${product.name} কার্টে যোগ হয়েছে`);
});

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

document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelector(".filter-btn.active")?.classList.remove("active");
        button.classList.add("active");
        selectedCategory = button.dataset.category;
        renderProducts();
    });
});

document.querySelectorAll('input[name="delivery"]').forEach(input => {
    input.addEventListener("change", updateTotals);
});

document.querySelectorAll('input[name="payment"]').forEach(input => {
    input.addEventListener("change", updatePaymentInstruction);
});

searchInput.addEventListener("input", renderProducts);
cartButton.addEventListener("click", openCart);
closeCartButton.addEventListener("click", closeCart);

cartModal.addEventListener("click", event => {
    if (event.target === cartModal) {
        closeCart();
    }
});

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

updatePaymentInstruction();
loadProductsFromFirebase();
renderCart();
