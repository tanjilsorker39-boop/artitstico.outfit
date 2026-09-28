// =============================================
// 🤖 ARTistico Chatbot — Rule-Based (100% Free)
// =============================================

const BUSINESS = {
    phone: "01636032218",
    email: "info.artisticowear@gmail.com",
    facebook: "facebook.com/artisticowear",
    website: "artisticooutfit.vercel.app",
    deliveryInside: 60,
    deliveryOutside: 120,
    bkash: "01636032218",
    nagad: "01636032218",
    products: [
        { name: "Sky Blue Striped Shirt", price: 299 },
        { name: "Pink Striped Shirt", price: 350 },
        { name: "White Striped Formal Shirt", price: 375 },
        { name: "Olive Green Striped Shirt", price: 399 },
        { name: "Black Striped Formal Shirt", price: 299 },
        { name: "Deep Indigo Striped Formal Shirt", price: 299 }
    ]
};

const KNOWLEDGE_BASE = [
    {
        keywords: ["hello", "hi", "hey", "assalamu", "salam", "আসসালামু", "হ্যালো", "হাই", "শুরু"],
        answer: "আসসালামু আলাইকুম! 👋\n\nআমি ARTistico Assistant। আপনার যেকোনো প্রশ্ন জিজ্ঞেস করুন।\n\nআমি যা জানি:\n• শার্টের দাম\n• ডেলিভারি চার্জ ও সময়\n• পেমেন্ট পদ্ধতি\n• সাইজ গাইড\n• রিটার্ন পলিসি\n• অর্ডার ট্র্যাকিং"
    },
    {
        keywords: ["ডেলিভারি চার্জ", "delivery charge", "ডেলিভারি খরচ", "শিপিং চার্জ", "ডেলিভারি কত", "কত টাকা ডেলিভারি"],
        answer: "💵 **ডেলিভারি চার্জ**\n\n📍 ঢাকার ভিতরে: ৳" + BUSINESS.deliveryInside + "\n📍 ঢাকার বাইরে: ৳" + BUSINESS.deliveryOutside + "\n\n⚡ শুধু ডেলিভারি চার্জ অ্যাডভান্স দিতে হবে। বাকি টাকা ক্যাশ অন ডেলিভারি (COD)।"
    },
    {
        keywords: ["ডেলিভারি", "delivery", "কত দিন", "কতদিন", "শিপিং", "shipping", "কবে পাব", "কখন পাব"],
        answer: "🚚 **ডেলিভারি তথ্য**\n\n📍 ঢাকার ভিতরে:\n• চার্জ: ৳" + BUSINESS.deliveryInside + "\n• সময়: ১-২ দিন\n\n📍 ঢাকার বাইরে:\n• চার্জ: ৳" + BUSINESS.deliveryOutside + "\n• সময়: ৩-৫ দিন\n\n💡 শুধু ডেলিভারি চার্জ অ্যাডভান্স, বাকি টাকা COD।"
    },
    {
        keywords: ["বিকাশ নম্বর", "bkash number", "নগদ নম্বর", "nagad number", "bkash", "nagad", "bikash", "কোন নম্বরে", "পেমেন্ট নম্বর"],
        answer: "📱 **আমাদের bKash/Nagad নম্বর:**\n\n💚 **" + BUSINESS.bkash + "**\n\nডেলিভারি চার্জ পাঠিয়ে TrxID ও Sender Number দিন।"
    },
    {
        keywords: ["পেমেন্ট", "payment", "কিভাবে টাকা", "ক্যাশ অন ডেলিভারি", "cod", "cash on delivery"],
        answer: "💰 **পেমেন্ট পদ্ধতি**\n\nআমরা **Cash on Delivery (COD)** নিই।\n\n📌 শুধু ডেলিভারি চার্জ (৳" + BUSINESS.deliveryInside + "/৳" + BUSINESS.deliveryOutside + ") অ্যাডভান্স দিতে হবে।\n\n✅ bKash: " + BUSINESS.bkash + "\n✅ Nagad: " + BUSINESS.nagad + "\n\n🔍 চেকআউটে TrxID + Sender Number দিতে হবে।"
    },
    {
        keywords: ["দাম", "price", "কত টাকা", "কত দাম", "শার্টের দাম", "প্রোডাক্টের দাম", "কত পড়বে"],
        answer: "🛍️ **শার্টের দাম**\n\n" + BUSINESS.products.map(function(p) { return "• " + p.name + ": ৳" + p.price; }).join("\n") + "\n\n✅ সব হাতে বাছাই করা\n✅ ১০০% অরিজিনাল\n\n👉 " + BUSINESS.website
    },
    {
        keywords: ["সাইজ", "size", "মাপ", "measurement", "কোন সাইজ", "sizes", "ফিট"],
        answer: "📏 **সাইজ গাইড**\n\nআমাদের সাইজ:\n• S — Chest 38\", Length 27\"\n• M — Chest 40\", Length 28\"\n• L — Chest 42\", Length 29\"\n• XL — Chest 44\", Length 30\"\n• XXL — Chest 46\", Length 31\"\n\n⚠️ মাপ ±১ ইঞ্চি পার্থক্য হতে পারে।\n\n👉 প্রতিটা প্রোডাক্টে Size Guide বাটন আছে।"
    },
    {
        keywords: ["রিটার্ন", "return", "ফেরত", "exchange", "বদল", "বদলাতে", "নষ্ট", "সমস্যা"],
        answer: "🔄 **রিটার্ন পলিসি**\n\n• ডেলিভারির ৪৮ ঘণ্টার মধ্যে জানাতে হবে\n• প্রোডাক্ট অব্যবহৃত অবস্থায় ফেরত দিতে হবে\n• সমস্যা হলে " + BUSINESS.phone + " এ WhatsApp করুন"
    },
    {
        keywords: ["অর্ডার করব", "order", "কিনব", "কিনতে চাই", "buy", "purchase", "কিভাবে কিনব", "কিভাবে অর্ডার"],
        answer: "🛒 **অর্ডার পদ্ধতি**\n\n১️⃣ ওয়েবসাইটে যান: " + BUSINESS.website + "\n২️⃣ পছন্দের শার্ট কার্টে যোগ করুন\n৩️⃣ Checkout করুন\n৪️⃣ ডেলিভারি চার্জ পাঠান bKash/Nagad-এ\n৫️⃣ TrxID দিন\n৬️⃣ অর্ডার কনফার্ম ✅\n\n❓ সমস্যা হলে WhatsApp: " + BUSINESS.phone
    },
    {
        keywords: ["ট্র্যাক", "track", "tracking", "অর্ডার কোথায়", "কোথায় আছে", "অর্ডার ট্র্যাক", "স্ট্যাটাস"],
        answer: "📦 **অর্ডার ট্র্যাকিং**\n\nঅর্ডার করার পর আপনি একটা নম্বর পাবেন:\n\n🎫 Format: ART-XXXXXX\n\n👉 ট্র্যাক করতে যান:\n" + BUSINESS.website + "/track\n\nসেখানে অর্ডার নম্বর দিয়ে স্ট্যাটাস দেখুন।"
    },
    {
        keywords: ["ক্যান্সেল", "cancel", "বাতিল", "cancel order", "বাতিল করতে", "ক্যানসেল"],
        answer: "❌ **অর্ডার বাতিল**\n\n✅ Pending অবস্থায় Cancel করা যাবে\n✅ ডেলিভারি চার্জ ফেরত পাবেন\n\n❌ Paid/Shipped হলে Cancel করা যাবে না\n❌ Advance ফেরত দেওয়া হবে না\n\n👉 ট্র্যাক পেজে গিয়ে Cancel করুন।"
    },
    {
        keywords: ["কে তোমরা", "about", "সম্পর্কে", "artistico ki", "কি ব্যবসা", "কে"],
        answer: "🏪 **ARTistico Wear সম্পর্কে**\n\n✅ হাতে বাছাই করা Secondhand শার্ট\n✅ ঢাকা, বাংলাদেশ\n✅ ১০০% অরিজিনাল\n✅ Quality-focused\n\n📞 " + BUSINESS.phone + "\n✉️ " + BUSINESS.email + "\n📘 " + BUSINESS.facebook
    },
    {
        keywords: ["যোগাযোগ", "contact", "ফোন", "phone", "নম্বর", "call", "ইমেইল", "email", "whatsapp"],
        answer: "📞 **যোগাযোগ**\n\n💬 WhatsApp: " + BUSINESS.phone + "\n📧 Email: " + BUSINESS.email + "\n📘 Facebook: " + BUSINESS.facebook + "\n\n⏰ সকাল ৯টা - রাত ১০টা"
    },
    {
        keywords: ["অরিজিনাল", "original", "quality", "কোয়ালিটি", "ভালো", "আসল", "থ্রিফটেড", "secondhand", "নতুন"],
        answer: "⭐ **Quality নিশ্চয়তা**\n\n✅ ১০০% অরিজিনাল\n✅ হাতে বাছাই করা প্রতিটা শার্ট\n✅ Quality check করা\n✅ কোনো সমস্যা হলে ফেরত\n\n💚 Secondhand = পরিবেশ বান্ধব"
    },
    {
        keywords: ["স্টক", "stock", "আছে কি", "available", "পাওয়া যাবে", "শেষ"],
        answer: "📦 **Stock তথ্য**\n\nআমাদের স্টক সীমিত — কারণ প্রতিটা শার্ট একটাই!\n\n👉 ওয়েবসাইটে দেখুন কোনটা available:\n" + BUSINESS.website + "\n\n⚡ দ্রুত কিনুন, শেষ হয়ে যেতে পারে!"
    },
    {
        keywords: ["ধন্যবাদ", "thanks", "thank you", "thank", "শুকরিয়া", "ভালো লাগলো"],
        answer: "আপনাকেও ধন্যবাদ! 😊\n\nআর কোনো প্রশ্ন থাকলে জিজ্ঞেস করুন।\n\n🛍️ শপিং করতে যান: " + BUSINESS.website
    },
    {
        keywords: ["bye", "বিদায়", "আল্লাহ হাফেজ", "goodbye", "চলে যাচ্ছি"],
        answer: "আল্লাহ হাফেজ! 👋\n\nআবার আসবেন। ভালো থাকুন! 🌟"
    }
];

// =============================================
// DOM Elements
// =============================================
const chatbotToggle = document.getElementById("chatbotToggle");
const chatbotWindow = document.getElementById("chatbotWindow");
const chatbotClose = document.getElementById("chatbotClose");
const chatbotMessages = document.getElementById("chatbotMessages");
const chatbotForm = document.getElementById("chatbotForm");
const chatbotInput = document.getElementById("chatbotInput");
const chatbotTyping = document.getElementById("chatbotTyping");
const chatbotBadge = document.querySelector(".chatbot-badge");

// =============================================
// Toggle Chat Window
// =============================================
if (chatbotToggle) {
    chatbotToggle.addEventListener("click", function() {
        chatbotWindow.classList.toggle("active");
        if (chatbotWindow.classList.contains("active")) {
            if (chatbotBadge) chatbotBadge.style.display = "none";
            setTimeout(function() { chatbotInput.focus(); }, 300);
        }
    });
}

if (chatbotClose) {
    chatbotClose.addEventListener("click", function() {
        chatbotWindow.classList.remove("active");
    });
}

// =============================================
// Add Message to UI
// =============================================
function addMessage(text, sender) {
    sender = sender || "bot";
    var messageDiv = document.createElement("div");
    messageDiv.className = "chatbot-message " + sender;

    var avatar = document.createElement("div");
    avatar.className = "chatbot-message-avatar";
    avatar.textContent = sender === "bot" ? "✦" : "👤";

    var content = document.createElement("div");
    content.className = "chatbot-message-content";

    var formatted = text
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br>");

    content.innerHTML = "<p>" + formatted + "</p>";

    if (sender === "bot") {
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
    } else {
        messageDiv.appendChild(content);
        messageDiv.appendChild(avatar);
    }

    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function showTyping() {
    if (chatbotTyping) chatbotTyping.style.display = "flex";
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function hideTyping() {
    if (chatbotTyping) chatbotTyping.style.display = "none";
}

// =============================================
// Find Answer
// =============================================
function findAnswer(message) {
    var lowerMsg = message.toLowerCase().trim();

    for (var i = 0; i < KNOWLEDGE_BASE.length; i++) {
        var item = KNOWLEDGE_BASE[i];
        for (var j = 0; j < item.keywords.length; j++) {
            if (lowerMsg.indexOf(item.keywords[j].toLowerCase()) !== -1) {
                return item.answer;
            }
        }
    }

    return "আমি এই প্রশ্নটা বুঝতে পারিনি। 😔\n\nআমি যা জানি:\n• শার্টের দাম\n• ডেলিভারি চার্জ\n• পেমেন্ট পদ্ধতি\n• সাইজ গাইড\n• রিটার্ন পলিসি\n• অর্ডার ট্র্যাকিং\n• অর্ডার বাতিল\n\n👉 আরও সাহায্যের জন্য WhatsApp করুন:\n💬 " + BUSINESS.phone;
}

// =============================================
// Handle Form Submit
// =============================================
if (chatbotForm) {
    chatbotForm.addEventListener("submit", function(e) {
        e.preventDefault();

        var message = chatbotInput.value.trim();
        if (!message) return;

        addMessage(message, "user");
        chatbotInput.value = "";
        chatbotInput.disabled = true;

        showTyping();

        setTimeout(function() {
            hideTyping();
            var reply = findAnswer(message);
            addMessage(reply, "bot");
            chatbotInput.disabled = false;
            chatbotInput.focus();
        }, 500);
    });
}

// =============================================
// Welcome Badge Hide
// =============================================
setTimeout(function() {
    if (chatbotBadge && chatbotWindow && !chatbotWindow.classList.contains("active")) {
        chatbotBadge.style.display = "none";
    }
}, 10000);

console.log("✅ ARTistico Chatbot (Rule-Based) initialized");
