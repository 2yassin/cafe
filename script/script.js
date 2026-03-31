// 1. إدارة السلة والذاكرة
let cart = JSON.parse(localStorage.getItem('cafe_order')) || { items: {}, total: 0 };

// 2. التقاط وتخزين رقم الطاولة من الرابط (index.html?table=5)
const urlParams = new URLSearchParams(window.location.search);
const tableFromUrl = urlParams.get('table');
if (tableFromUrl) {
    localStorage.setItem('table_id', tableFromUrl);
}

// 3. دالة تحديث الكمية
function updateQty(id, change, price, name) {
    if (!cart.items[id]) {
        cart.items[id] = { name: name, qty: 0, price: price };
    }
    
    if (cart.items[id].qty + change >= 0) {
        cart.items[id].qty += change;
        cart.total += (change * price);
        
        refreshUI(id);
        localStorage.setItem('cafe_order', JSON.stringify(cart));
    }
}

// 4. تحديث الواجهة (العدادات والبار السفلي)
function refreshUI(currentId = null) {
    if (currentId) {
        const countEl = document.getElementById(currentId);
        if (countEl) countEl.innerText = cart.items[currentId].qty;
    }

    const totalDisplay = document.getElementById('totalDisplay');
    const footerCart = document.getElementById('footerCart');
    
    if (totalDisplay) totalDisplay.innerText = cart.total;
    if (footerCart) {
        footerCart.style.display = (cart.total > 0) ? 'block' : 'none';
    }
}

// 5. إرسال الطلب للواتساب (تنسيق عربي + وقت إنجليزي + تصفير)
function sendToWhatsApp() {
    const savedTable = localStorage.getItem('table_id') || "غير محددة";
    
    if (!cart || cart.total === 0) {
        alert("السلة فارغة!");
        return;
    }

    const timeString = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    let msg = `*📍 طلب جديد من الطاولة:* \`${savedTable}\` %0A`;
    msg += `----------------------------%0A`;
    
    for (let id in cart.items) {
        let item = cart.items[id];
        if (item.qty > 0) {
            msg += `• ${item.name} (${item.qty}) ➔ ${item.qty * item.price} ليرة%0A`;
        }
    }
    
    msg += `----------------------------%0A`;
    msg += `*💰 المجموع الكلي:* \`${cart.total} ليرة\` %0A`;
    msg += `*⏰ وقت الطلب:* ${timeString}`;

    window.open(`https://wa.me/306986387315?text=${msg}`, '_blank');

    // تصفير السلة بعد الإرسال
    localStorage.removeItem('cafe_order');
    location.reload();
}

// 6. تشغيل النظام وإظهار رقم الطاولة فور التحميل
window.onload = function() {
    // استعادة العدادات
    for (let id in cart.items) {
        const countEl = document.getElementById(id);
        if (countEl) countEl.innerText = cart.items[id].qty;
    }
    refreshUI();
    
    // إظهار شارة رقم الطاولة بشكل ثابت ومضمون
    const tableId = localStorage.getItem('table_id');
    if (tableId) {
        const badge = document.createElement('div');
        badge.style = `
            position: fixed; top: 10px; left: 50%; transform: translateX(-50%);
            background: #fbbf24; color: #000; padding: 5px 20px; border-radius: 50px;
            font-weight: 900; z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            border: 2px solid #fff; direction: rtl;
        `;
        badge.innerText = `📍 طاولة رقم: ${tableId}`;
        document.body.appendChild(badge);
    }
};