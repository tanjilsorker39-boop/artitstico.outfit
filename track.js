// =============================================
// 📦 ARTistico - Order Tracking
// =============================================

const FIREBASE_URL = "https://artistico-c3a5e-default-rtdb.asia-southeast1.firebasedatabase.app";

const orderInput = document.getElementById('orderNumberInput');
const trackButton = document.getElementById('trackButton');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const resultContainer = document.getElementById('resultContainer');

// Firebase থেকে সব অর্ডার লোড
async function findOrder(orderNumber) {
    try {
        const res = await fetch(`${FIREBASE_URL}/Orders.json`);
        const data = await res.json();

        if (!data) {
            return null;
        }

        // Order Number মিলে যাওয়া অর্ডার খুঁজি
        const normalizedSearch = orderNumber.trim().toUpperCase();
        let foundOrder = null;

        Object.keys(data).forEach(key => {
            const order = data[key];
            if (order && order.orderNumber) {
                if (order.orderNumber.toUpperCase() === normalizedSearch) {
                    foundOrder = order;
                }
            }
        });

        return foundOrder;

    } catch (err) {
        console.error('Firebase error:', err);
        throw err;
    }
}

// UI State Management
function showLoading() {
    loadingState.style.display = 'block';
    errorState.style.display = 'none';
    resultContainer.style.display = 'none';
}

function hideLoading() {
    loadingState.style.display = 'none';
}

function showError(message) {
    errorMessage.textContent = message;
    errorState.style.display = 'block';
    resultContainer.style.display = 'none';
}

function showResult(order) {
    // Order Number
    document.getElementById('resultOrderNumber').textContent = order.orderNumber || 'N/A';

    // Status Badge
    const statusBadge = document.getElementById('resultStatusBadge');
    const status = (order.status || 'pending').toLowerCase();
    statusBadge.textContent = status.toUpperCase();
    statusBadge.className = 'track-status-badge status-' + status;

    // Timeline Update
    updateTimeline(status);

    // Details
    document.getElementById('resultCustomer').textContent = order.customer?.name || 'N/A';
    document.getElementById('resultPhone').textContent = order.customer?.phone || 'N/A';
    document.getElementById('resultDelivery').textContent = order.delivery?.area || 'N/A';
    document.getElementById('resultPayment').textContent = order.payment || 'N/A';
    document.getElementById('resultTrx').textContent = order.trxId || 'N/A';
    document.getElementById('resultTotal').textContent = '৳' + (order.total || 0);

    // Items
    const itemsContainer = document.getElementById('resultItems');
    if (order.items && order.items.length > 0) {
        itemsContainer.innerHTML = order.items.map(item => `
            <div class="track-item-row">
                <div>
                    <div class="track-item-name">${item.name || 'Product'}</div>
                    <div class="track-item-meta">Size: ${item.size || '-'} · Qty: ${item.quantity || 1}</div>
                </div>
                <div class="track-item-price">৳${item.price || 0}</div>
            </div>
        `).join('');
    } else {
        itemsContainer.innerHTML = '<p style="color: var(--muted); font-size: 13px;">কোনো আইটেম নেই</p>';
    }

    resultContainer.style.display = 'block';
    errorState.style.display = 'none';
    loadingState.style.display = 'none';

    // Scroll to result
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Timeline Steps আপডেট
function updateTimeline(status) {
    const steps = document.querySelectorAll('.track-step');

    // Reset
    steps.forEach(step => step.classList.remove('completed'));

    // Status অনুযায়ী step completed
    const statusOrder = ['pending', 'pending_verification', 'paid', 'shipped', 'delivered'];
    const statusIndex = statusOrder.indexOf(status);

    // সব সময় প্রথম step (placed) completed
    steps[0]?.classList.add('completed');

    if (statusIndex >= 1 || status === 'paid' || status === 'shipped' || status === 'delivered') {
        steps[1]?.classList.add('completed');
    }
    if (status === 'shipped' || status === 'delivered') {
        steps[2]?.classList.add('completed');
    }
    if (status === 'delivered') {
        steps[3]?.classList.add('completed');
    }

    // Failed হলে red
    if (status === 'failed') {
        steps.forEach(step => {
            step.classList.remove('completed');
            step.style.opacity = '0.5';
        });
    }
}

// Main Track Function
async function trackOrder() {
    const orderNumber = orderInput.value.trim();

    if (!orderNumber) {
        showError('দয়া করে অর্ডার নম্বর লিখুন।');
        return;
    }

    if (orderNumber.length < 5) {
        showError('সঠিক অর্ডার নম্বর লিখুন (যেমন: ART-123456)।');
        return;
    }

    showLoading();

    try {
        const order = await findOrder(orderNumber);
        hideLoading();

        if (!order) {
            showError(`অর্ডার "${orderNumber}" পাওয়া যায়নি। আবার চেষ্টা করুন অথবা WhatsApp-এ যোগাযোগ করুন।`);
            return;
        }

        showResult(order);

    } catch (err) {
        hideLoading();
        showError('সমস্যা হয়েছে। আবার চেষ্টা করুন।');
        console.error(err);
    }
}

// Events
if (trackButton) {
    trackButton.addEventListener('click', trackOrder);
}

if (orderInput) {
    orderInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            trackOrder();
        }
    });

    // Auto format: Enter চাপলে ট্র্যাক
    orderInput.focus();
}

// URL-এ ?order=ART-XXXXXX থাকলে auto search
const urlParams = new URLSearchParams(window.location.search);
const orderFromUrl = urlParams.get('order');
if (orderFromUrl) {
    orderInput.value = orderFromUrl;
    trackOrder();
}

console.log('✅ ARTistico Track Order initialized');
