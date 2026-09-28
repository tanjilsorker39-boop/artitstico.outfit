// =============================================
// 🤖 ARTistico AI Chatbot (Gemini API)
// =============================================

// ⚠️ এই লাইনে আপনার API Key বসান
const GEMINI_API_KEY = "AQ.Ab8RN6ILdqZYVmf4zgP9Wgmqfdbo0Zm5jqhDbTPx_9yPCEkrOw";

// Gemini API Endpoint
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// =============================================
// ARTistico Business Info (AI এটা জানে)
// =============================================
const BUSINESS_INFO = `
আপনি ARTistico Wear-এর AI Assistant। আপনার নাম "ARTistico Assistant"।

📌 BUSINESS INFO:
- নাম: ARTistico Wear
- ঠিকানা: ঢাকা, বাংলাদেশ
- Email: info.artisticowear@gmail.com
- Phone/WhatsApp: 01636032218
- Facebook: facebook.com/artisticowear
- ওয়েবসাইট: artisticooutfit.vercel.app

🛍️ PRODUCTS:
- Secondhand/Thrifted শার্ট বিক্রি করি
- দাম: ৳299 থেকে ৳399 পর্যন্ত
- সাইজ: S, M, L, XL, XXL
- সব প্রোডাক্ট হাতে বাছাই করা, ১০০% অরিজিনাল

💰 PAYMENT:
- Cash on Delivery (COD) - মূল পেমেন্ট
- শুধু ডেলিভারি চার্জ অ্যাডভান্স দিতে হয়
- bKash/Nagad: 01636032218

🚚 DELIVERY:
- ঢাকার ভিতরে: ৳60 (১-২ দিন)
- ঢাকার বাইরে: ৳120 (৩-৫ দিন)
- ডেলিভারি চার্জ অ্যাডভান্স, বাকি COD

🔄 RETURN POLICY:
- ডেলিভারির ৪৮ ঘণ্টার মধ্যে সমস্যা জানাতে হবে
- প্রোডাক্ট অব্যবহৃত অবস্থায় ফেরত

📦 ORDER TRACKING:
- অর্ডার করার পর ART-XXXXXX নম্বর পাবেন
- artisticooutfit.vercel.app/track এ ট্র্যাক করুন

❌ CANCEL POLICY:
- Pending অবস্থায় Cancel করা যাবে
- Advance ফেরত পাবে
- Paid/Shipped হলে Cancel করা যাবে না

🗣️ আপনার কাজ:
1. বাংলা এবং English দুটোতেই উত্তর দিন (কাস্টমার যে ভাষায় প্রশ্ন করবে)
2. সহজ, বিনয়ী, এবং প্রফেশনাল ভাষায় উত্তর দিন
3. কম কথা বলুন — সোজা উত্তর দিন
4. কাস্টমার রাগ করলে শান্ত থাকুন
5. জানা না থাকলে বলুন "এটা নিশ্চিত করতে WhatsApp-এ যোগাযোগ করুন: 01636032218"
6. অর্ডার দিতে চাইলে ওয়েবসাইটে নিয়ে যান: artisticooutfit.vercel.app
7. কখনো ভুয়া তথ্য দেবেন না

💡 TONE: বিনয়ী, বন্ধুত্বপূর্ণ, সাহায্যকারী।
`;

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
// State
// =============================================
let conversationHistory = [];

// =============================================
// Toggle Chat Window
// =============================================
if (chatbotToggle) {
    chatbotToggle.addEventListener("click", () => {
        chatbotWindow.classList.toggle("active");
        if (chatbotWindow.classList.contains("active")) {
            if (chatbotBadge) chatbotBadge.style.display = "none";
            setTimeout(() => chatbotInput.focus(), 300);
        }
    });
}

if (chatbotClose) {
    chatbotClose.addEventListener("click", () => {
        chatbotWindow.classList.remove("active");
    });
}

// =============================================
// Add Message to UI
// =============================================
function addMessage(text, sender = "bot") {
    const messageDiv = document.createElement("div");
    messageDiv.className = "chatbot-message " + sender;

    const avatar = document.createElement("div");
    avatar.className = "chatbot-message-avatar";
    avatar.textContent = sender === "bot" ? "🤖" : "👤";

    const content = document.createElement("div");
    content.className = "chatbot-message-content";

    // Convert line breaks + basic formatting
    const formatted = text
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

// =============================================
// Show/Hide Typing
// =============================================
function showTyping() {
    if (chatbotTyping) chatbotTyping.style.display = "flex";
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function hideTyping() {
    if (chatbotTyping) chatbotTyping.style.display = "none";
}

// =============================================
// Call Gemini API
// =============================================
async function askGemini(userMessage) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
        return "⚠️ API Key সেট করা হয়নি। Admin কে জানান।";
    }

    // Add user message to history
    conversationHistory.push({
        role: "user",
        parts: [{ text: userMessage }]
    });

    // Keep last 10 messages (to save tokens)
    if (conversationHistory.length > 10) {
        conversationHistory = conversationHistory.slice(-10);
    }

    const requestBody = {
        contents: [
            {
                role: "user",
                parts: [{ text: BUSINESS_INFO + "\n\n=== কাস্টমারের প্রশ্ন ===\n" + userMessage }]
            }
        ],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
            topP: 0.95,
            topK: 40
        }
    };

    try {
        const res = await fetch(GEMINI_API_URL + "?key=" + GEMINI_API_KEY, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error("Gemini API Error:", errText);
            if (res.status === 429) {
                return "⚠️ এইমুহূর্তে অনেক প্রশ্ন আসছে। একটু পরে চেষ্টা করুন, অথবা WhatsApp-এ যোগাযোগ করুন: 01636032218";
            }
            return "❌ সমস্যা হয়েছে। আবার চেষ্টা করুন, অথবা WhatsApp-এ যোগাযোগ করুন: 01636032218";
        }

        const data = await res.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const botReply = data.candidates[0].content.parts[0].text;
            conversationHistory.push({
                role: "model",
                parts: [{ text: botReply }]
            });
            return botReply;
        }

        return "❌ উত্তর পাইনি। আবার চেষ্টা করুন।";
    } catch (err) {
        console.error("Fetch Error:", err);
        return "❌ ইন্টারনেট সমস্যা। আবার চেষ্টা করুন।";
    }
}

// =============================================
// Handle Form Submit
// =============================================
if (chatbotForm) {
    chatbotForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const message = chatbotInput.value.trim();
        if (!message) return;

        addMessage(message, "user");
        chatbotInput.value = "";
        chatbotInput.disabled = true;

        showTyping();

        try {
            const reply = await askGemini(message);
            hideTyping();
            addMessage(reply, "bot");
        } catch (err) {
            hideTyping();
            addMessage("❌ সমস্যা হয়েছে। আবার চেষ্টা করুন।", "bot");
        } finally {
            chatbotInput.disabled = false;
            chatbotInput.focus();
        }
    });
}

// =============================================
// Welcome Badge Hide after 10 sec
// =============================================
setTimeout(() => {
    if (chatbotBadge && chatbotWindow && !chatbotWindow.classList.contains("active")) {
        chatbotBadge.style.display = "none";
    }
}, 10000);

console.log("✅ ARTistico AI Chatbot initialized");
