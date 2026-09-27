// =============================================
// 📦 ARTistico - Order Tracking + Cancel System
// =============================================

const FIREBASE_URL = "https://artistico-c3a5e-default-rtdb.asia-southeast1.firebasedatabase.app";

const orderInput = document.getElementById('orderNumberInput');
const trackButton = document.getElementById('trackButton');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const resultContainer = document.getElementById('resultContainer');
const cancelSection = document.getElementById('cancelSection');
const noCancelNotice = document.getElementById('noCancelNotice');
const noCancelReason = document.getElementById('noCancelReason');
const refundStatus = document.getElementById('refundStatus');
const refundStatusTitle = document.getElementById('refundStatusTitle');
const refundStatusText = document.getElementById('refundStatusText');
const cancelConfirmModal = document.getElementById('cancelConfirmModal');
const refundAmountConfirm = document.getElementById('refundAmountConfirm');
const cancelOrderBtn = document.getElementById('cancelOrderBtn');
const cancelNo = document.getElementById('cancelNo');
const cancelYes = document.getElementById('cancelYes');

let currentOrder = null;
let currentOrderKey = null;

// =============================================
// Firebase থেকে অর্ডার খোঁজা
// =============================================
async function findOrder(orderNumber) {
    try {
        const res = await fetch(FIREBASE_URL + "/Orders.json");
        const data = await res.json();
        if (!data) return null;

        const normalizedSearch = orderNumber.trim().toUpperCase();
        let foundOrder = null;
        let foundKey = null;

        Object.keys(data).forEach(key => {
            const order = data[key];
            if (order && order.orderNumber) {
                if (order.orderNumber.toUpperCase() === normalizedSearch) {
                    foundOrder = order;
                    foundKey = key;
                }
            }
        });

        return foundOrder ? { order: foundOrder, key: foundKey } : null;
    } catch (err) {
        console.error('Firebase error:', err);
        throw err;
    }
}

// =============================================
// UI State
// =============================================
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
    document.getElementById('resultOrderNumber').textContent = order.orderNumber || 'N/A';

    const statusBadge = document.getElementById('resultStatusBadge');
    const status = (order.status || 'pending').toLowerCase();
    statusBadge.textContent = status.toUpperCase().replace(/_/g, ' ');
    statusBadge.className = 'track-status-badge status-' + status;

    updateTimeline(status);

    document.getElementById('resultCustomer').textContent = order.customer?.name || 'N/A';
    document.getElementById('resultPhone').textContent = order.customer?.phone || 'N/A';
    document.getElementById('resultDelivery').textContent = order.delivery?.area || 'N/A';
    document.getElementById('resultAdvance').textContent = '৳' + (order.advancePaid || order.deliveryCharge || order.delivery?.charge || 0) + ' (পেইড)';
    document.getElementById('resultCOD').textContent = '৳' + (order.codAmount || order.subtotal || 0);
    document.getElementById('resultPayment').textContent = order.payment || 'N/A';
    document.getElementById('resultTrx').textContent = order.trxId || 'N/A';
    document.getElementById('resultTotal').textContent = '৳' + (order.total || 0);

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

    // ✅ Cancel Section Logic
    handleCancelSection(order);

    resultContainer.style.display = 'block';
    errorState.style.display = 'none';
    loadingState.style.display = 'none';
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// =============================================
// Cancel Section Handler
// =============================================
function handleCancelSection(order) {
    const status = (order.status || 'pending').toLowerCase();

    // Hide all first
    cancelSection.style.display = 'none';
    noCancelNotice.style.display = 'none';
    refundStatus.style.display = 'none';

    // Cancelled by customer
    if (status === 'cancelled' || status === 'cancelled_refund_pending' || status === 'cancelled_refunded') {
        refundStatus.style.display = 'flex';
        if (status === 'cancelled_refund_pending') {
            refundStatusTitle.textContent = 'Refund Pending';
            refundStatusText.textContent = 'আপনার ৳' + (order.advancePaid || order.deliveryCharge || 0) + ' ফেরত পাঠানো হবে ২৪ ঘণ্টার মধ্যে।';
        } else if (status === 'cancelled_refunded') {
            refundStatusTitle.textContent = '✅ Refund Done';
            refundStatusText.textContent = '৳' + (order.advancePaid || order.deliveryCharge || 0) + ' আপনার bKash/Nagad-এ পাঠানো হয়েছে।';
        }
        return;
    }

    // Pending / pending_verification → Cancel allowed
    if (status === 'pending' || status === 'pending_verification') {
        cancelSection.style.display = 'block';
        const advanceAmount = order.advancePaid || order.deliveryCharge || order.delivery?.charge || 0;
        refundAmountConfirm.textContent = '৳' + advanceAmount;
        return;
    }

    // Verified / Paid / Shipped / Delivered → No Cancel
    noCancelNotice.style.display = 'block';
    if (status === 'paid' || status === 'verified') {
        noCancelReason.textContent = 'অর্ডার কনফার্ম হয়ে গেছে। এখন Cancel করা সম্ভব নয়।';
    } else if (status === 'shipped') {
        noCancelReason.textContent = 'আপনার অর্ডার Courier-এ পাঠানো হয়েছে। এখন Cancel করা সম্ভব নয়।';
    } else if (status === 'delivered') {
        noCancelReason.textContent = 'অর্ডার ডেলিভার হয়ে গেছে।';
    } else if (status === 'returned') {
        noCancelReason.textContent = 'অর্ডার Return হয়েছে। Advance ফেরত দেওয়া সম্ভব নয়।';
    } else {
        noCancelReason.textContent = 'এই অর্ডারটি এখন Cancel করা সম্ভব নয়।';
    }
}

// =============================================
// Timeline Update
// =============================================
function updateTimeline(status) {
    const steps = document.querySelectorAll('.track-step');
    steps.forEach(step => step.classList.remove('completed'));

    const statusOrder = ['pending', 'pending_verification', 'paid', 'verified', 'shipped', 'delivered'];
    const statusIndex = statusOrder.indexOf(status);

    steps[0]?.classList.add('completed');
    if (statusIndex >= 3 || status === 'paid' || status === 'shipped' || status === 'delivered') {
        steps[1]?.classList.add('completed');
    }
    if (status === 'shipped' || status === 'delivered') {
        steps[2]?.classList.add('completed');
    }
    if (status === 'delivered') {
        steps[3]?.classList.add('completed');
    }

    if (status === 'cancelled' || status === 'cancelled_refund_pending' || status === 'cancelled_refunded' || status === 'failed') {
        steps.forEach(step => {
            step.classList.remove('completed');
            step.style.opacity = '0.3';
        });
    }
}

// =============================================
// Cancel Order
// =============================================
function openCancelConfirm() {
    if (!currentOrder) return;
    cancelConfirmModal.style.display = 'flex';
}

function closeCancelConfirm() {
    cancelConfirmModal.style.display = 'none';
}

async function confirmCancel() {
    if (!currentOrder || !currentOrderKey) return;

    const status = (currentOrder.status || 'pending').toLowerCase();
    if (status !== 'pending' && status !== 'pending_verification') {
        alert('এই অর্ডারটি এখন Cancel করা সম্ভব নয়।');
        closeCancelConfirm();
        return;
    }

    try {
        await fetch(FIREBASE_URL + "/Orders/" + currentOrderKey + ".json", {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'cancelled_refund_pending',
                cancelledAt: new Date().toISOString(),
                cancelledBy: 'customer',
                refundAmount: currentOrder.advancePaid || currentOrder.deliveryCharge || 0,
                refundStatus: 'pending'
            })
        });

        closeCancelConfirm();
        alert('✅ আপনার অর্ডার বাতিল হয়েছে।\n\nআপনার ডেলিভারি চার্জ ফেরত পাঠানো হবে ২৪ ঘণ্টার মধ্যে।');
        trackOrder();
    } catch (err) {
        console.error('Cancel error:', err);
        alert('❌ Cancel করা যায়নি। আবার চেষ্টা করুন।');
        closeCancelConfirm();
    }
}

// =============================================
// Main Track Function
// =============================================
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
        const result = await findOrder(orderNumber);
        hideLoading();

        if (!result) {
            showError('অর্ডার "' + orderNumber + '" পাওয়া যায়নি। আবার চেষ্টা করুন অথবা WhatsApp-এ যোগাযোগ করুন।');
            return;
        }

        currentOrder = result.order;
        currentOrderKey = result.key;
        showResult(result.order);
    } catch (err) {
        hideLoading();
        showError('সমস্যা হয়েছে। আবার চেষ্টা করুন।');
        console.error(err);
    }
}

// =============================================
// Events
// =============================================
if (trackButton) trackButton.addEventListener('click', trackOrder);

if (orderInput) {
    orderInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') trackOrder();
    });
    orderInput.focus();
}

if (cancelOrderBtn) cancelOrderBtn.addEventListener('click', openCancelConfirm);
if (cancelNo) cancelNo.addEventListener('click', closeCancelConfirm);
if (cancelYes) cancelYes.addEventListener('click', confirmCancel);

if (cancelConfirmModal) {
    cancelConfirmModal.addEventListener('click', (e) => {
        if (e.target === cancelConfirmModal) closeCancelConfirm();
    });
}

// URL-এ ?order=ART-XXXXXX থাকলে auto search
const urlParams = new URLSearchParams(window.location.search);
const orderFromUrl = urlParams.get('order');
if (orderFromUrl) {
    orderInput.value = orderFromUrl;
    trackOrder();
}

console.log('✅ ARTistico Track Order + Cancel System initialized');
