// Konfigurasi
const API_URL = "URL_WEB_APP_GOOGLE_APPS_SCRIPT_ANDA_DI_SINI"; // Ganti dengan URL dari Step 1
const WA_NUMBER = "6281234567890"; // Ganti dengan nomor WA penjual

// State Management
let productsData = [];
let cart = [];

// Format Rupiah
const formatRp = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
};

// Navigasi Antar Halaman (SPA)
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    // Update Bottom Nav UI
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    if(pageId === 'home-page') document.querySelectorAll('.nav-item')[0].classList.add('active');
    if(pageId === 'cart-page') document.querySelectorAll('.nav-item')[1].classList.add('active');
    if(pageId === 'admin-page') document.querySelectorAll('.nav-item')[2].classList.add('active');
}

// Fetch Data dari Google Sheet
async function loadProducts() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (data.status === "success") {
            productsData = data.data;
            renderKatalog();
        }
    } catch (error) {
        document.getElementById('product-list').innerHTML = '<div style="color:red;">Gagal memuat data. Pastikan Google Sheet Web App aktif.</div>';
    }
}

// Render Katalog ke HTML
function renderKatalog() {
    const list = document.getElementById('product-list');
    list.innerHTML = '';
    
    productsData.forEach(p => {
        // Fallback gambar jika kosong
        const img = p.Image1 ? p.Image1 : 'https://via.placeholder.com/150';
        
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => openDetail(p.ID);
        card.innerHTML = `
            <img src="${img}" alt="${p.Nama}" class="product-img">
            <div class="product-title">${p.Nama}</div>
            <div class="product-price">${formatRp(p.Harga)}</div>
            <div class="product-meta">
                <span>Stok: ${p.Stok}</span>
                <span>Terjual: ${p.Terjual}</span>
            </div>
        `;
        list.appendChild(card);
    });
}

// Buka Halaman Detail
function openDetail(id) {
    const p = productsData.find(x => x.ID === id);
    if(!p) return;
    
    const detailContent = document.getElementById('detail-content');
    const img = p.Image1 ? p.Image1 : 'https://via.placeholder.com/400';
    
    // URL Link Barang (Simulasi URL untuk web kita nanti)
    const baseUrl = window.location.href.split('#')[0]; 
    
    detailContent.innerHTML = `
        <img src="${img}" class="slider-img" alt="${p.Nama}">
        <h2>${p.Nama}</h2>
        <div class="detail-price">${formatRp(p.Harga)}</div>
        <div class="product-meta" style="margin-bottom: 16px; font-size:0.9rem;">
            <span>Stok tersedia: <b>${p.Stok}</b></span> | 
            <span>Terjual: <b>${p.Terjual}</b></span>
        </div>
        <div class="section-title">Deskripsi Produk</div>
        <div class="detail-desc">${p.Deskripsi}</div>
        <button class="btn-primary" onclick="addToCart('${p.ID}')">Tambahkan ke Keranjang</button>
    `;
    
    showPage('detail-page');
}

// Tambah ke Keranjang
function addToCart(id) {
    const p = productsData.find(x => x.ID === id);
    const exist = cart.find(x => x.ID === id);
    
    if(exist) {
        exist.qty += 1;
    } else {
        cart.push({...p, qty: 1});
    }
    
    updateCartUI();
    alert(`${p.Nama} ditambahkan ke keranjang!`);
}

// Update UI Keranjang
function updateCartUI() {
    document.getElementById('cart-count').innerText = cart.reduce((acc, curr) => acc + curr.qty, 0);
    
    const cartList = document.getElementById('cart-list');
    cartList.innerHTML = '';
    
    let total = 0;
    
    if(cart.length === 0) {
        cartList.innerHTML = '<p class="text-muted">Keranjang masih kosong.</p>';
    } else {
        cart.forEach(item => {
            const subtotal = item.Harga * item.qty;
            total += subtotal;
            
            cartList.innerHTML += `
                <div class="cart-item">
                    <div class="cart-info">
                        <h4>${item.Nama}</h4>
                        <span class="text-muted">${formatRp(item.Harga)} x ${item.qty}</span>
                    </div>
                    <div style="font-weight: bold;">${formatRp(subtotal)}</div>
                </div>
            `;
        });
    }
    
    document.getElementById('cart-total').innerText = formatRp(total);
}

// Checkout via WhatsApp
function checkoutWA() {
    if(cart.length === 0) {
        alert("Keranjang masih kosong!");
        return;
    }
    
    let text = "Halo admin, saya ingin memesan produk berikut:\n\n";
    let total = 0;
    const baseUrl = window.location.href.split('#')[0]; // Mendapatkan URL domain
    
    cart.forEach((item, index) => {
        const subtotal = item.Harga * item.qty;
        total += subtotal;
        text += `${index + 1}. *${item.Nama}*\n`;
        text += `   Jumlah: ${item.qty}\n`;
        text += `   Subtotal: ${formatRp(subtotal)}\n`;
        // Membuat simulasi link produk berdasarkan ID
        text += `   Link: ${baseUrl}?id=${item.ID}\n\n`; 
    });
    
    text += `*Total Pembelian: ${formatRp(total)}*\n\n`;
    text += `Mohon segera diproses ya, terima kasih.`;
    
    const encodedText = encodeURIComponent(text);
    const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodedText}`;
    
    window.open(waUrl, '_blank');
}

// Init App
window.onload = () => {
    loadProducts();
};