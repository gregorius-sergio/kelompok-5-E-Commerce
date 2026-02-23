document.addEventListener('DOMContentLoaded', () => {
    // ---- 1. CART LOGIC ----
    const cartBtn = document.getElementById('cartBtn');
    const cartDropdown = document.getElementById('cartDropdown');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const cartItemsCountLabel = document.getElementById('cartItemsCountLabel');

    let cart = JSON.parse(localStorage.getItem('blckwht_modern_cart')) || [];

    function updateCartUI() {
        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = '';
        let total = 0;
        let count = 0;

        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            count += item.quantity;

            const cartItemDiv = document.createElement('div');
            cartItemDiv.className = 'flex items-center gap-4 group';
            cartItemDiv.innerHTML = `
                <div class="w-16 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover">
                </div>
                <div class="flex-1">
                    <h4 class="text-sm font-semibold truncate w-36">${item.title}</h4>
                    <p class="text-xs text-gray-500 mt-1">Rp ${item.price.toLocaleString('id-ID')} x ${item.quantity}</p>
                </div>
                <button class="cart-remove w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors" data-index="${index}">
                    <i class="ph ph-trash pointer-events-none"></i>
                </button>
            `;
            cartItemsContainer.appendChild(cartItemDiv);
        });

        if (cartCount) cartCount.innerText = count;
        if (cartItemsCountLabel) cartItemsCountLabel.innerText = `${count} items`;
        if (cartTotal) cartTotal.innerText = `Rp ${total.toLocaleString('id-ID')}`;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-center text-gray-400 text-sm py-4">Your bag is empty.</p>';
        }

        document.querySelectorAll('.cart-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.getAttribute('data-index');
                cart.splice(index, 1);
                saveCart();
            });
        });
    }

    function saveCart() {
        localStorage.setItem('blckwht_modern_cart', JSON.stringify(cart));
        updateCartUI();
    }

    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        saveCart();
        if (cartDropdown && cartDropdown.classList.contains('hidden')) {
            cartDropdown.classList.remove('hidden');
        }
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Your bag is empty!');
                return;
            }
            const phoneNumber = "6281234567890";
            let message = "Halo BLCKWHT, saya ingin memesan:\\n\\n";
            let total = 0;
            cart.forEach((item, index) => {
                message += `${index + 1}. ${item.title} (x${item.quantity}) - Rp ${(item.price * item.quantity).toLocaleString('id-ID')}\\n`;
                total += item.price * item.quantity;
            });
            message += `\\n*TOTAL: Rp ${total.toLocaleString('id-ID')}*\\n\\nMohon informasi ongkos kirim.`;
            window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
        });
    }

    // Toggle dropdowns
    document.addEventListener('click', (e) => {
        // Cart
        if (cartBtn && e.target === cartBtn || cartBtn?.contains(e.target)) {
            cartDropdown.classList.toggle('hidden');
        } else if (cartDropdown && !cartDropdown.contains(e.target)) {
            cartDropdown.classList.add('hidden');
        }
    });

    // ---- 2. GLOBAL DATA & SEARCH ----
    const searchBtn = document.getElementById('searchBtn');
    const searchBox = document.getElementById('searchBox');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const productGrid = document.getElementById('productGrid');

    let allProducts = [];

    // Fetch once
    fetch('data.json')
        .then(res => res.json())
        .then(data => {
            allProducts = data;

            // Initialize Grid if on a catalog page
            if (productGrid) {
                const pageNum = parseInt(document.body.getAttribute('data-page')) || 1;
                renderProductGrid(pageNum);
            }
        })
        .catch(err => {
            console.error("Error fetching data", err);
            if (productGrid) productGrid.innerHTML = "<div class='col-span-3 text-center py-20 text-gray-400'>Failed to load catalog.</div>";
        });

    if (searchBtn && searchBox) {
        searchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = searchBox.classList.contains('hidden');
            if (isHidden) {
                searchBox.classList.remove('hidden');
                setTimeout(() => {
                    searchBox.classList.remove('opacity-0');
                    searchInput.focus();
                }, 10);
            } else {
                searchBox.classList.add('opacity-0');
                setTimeout(() => searchBox.classList.add('hidden'), 300);
            }
        });

        document.addEventListener('click', (e) => {
            if (!searchBox.contains(e.target) && e.target !== searchBtn && !searchBtn.contains(e.target)) {
                searchBox.classList.add('opacity-0');
                setTimeout(() => searchBox.classList.add('hidden'), 300);
            }
        });

        if (searchInput && searchResults) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                searchResults.innerHTML = '';

                if (query.length < 2) return;

                const filtered = allProducts.filter(p => p.title.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query));

                if (filtered.length === 0) {
                    searchResults.innerHTML = '<p class="text-xs text-gray-500 p-2">No products found.</p>';
                    return;
                }

                filtered.slice(0, 5).forEach(p => {
                    const item = document.createElement('a');
                    item.href = `product${p.id.replace('p', '')}.html`;
                    item.className = 'flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors';
                    item.innerHTML = `
                        <img src="${p.image}" class="w-10 h-10 object-cover rounded-md">
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-semibold text-primary truncate">${p.title}</p>
                            <p class="text-xs text-gray-500 truncate">Rp ${p.price.toLocaleString('id-ID')}</p>
                        </div>
                    `;
                    searchResults.appendChild(item);
                });
            });
        }
    }

    // ---- 3. RENDER ENHANCED GRID ----
    function renderProductGrid(pageNum) {
        let startIndex = (pageNum - 1) * 6;
        let endIndex = startIndex + 6;
        let productsToShow = allProducts.slice(startIndex, endIndex);

        productGrid.innerHTML = '';

        productsToShow.forEach(p => {
            const card = document.createElement('div');
            card.className = 'group bg-white rounded-3xl p-0 shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 flex flex-col relative overflow-hidden';

            const badgeHTML = p.stock < 10
                ? `<div class="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-md">Low Stock</div>`
                : `<div class="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur text-primaryDark px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm">Trending</div>`;

            card.innerHTML = `
                ${badgeHTML}
                
                <a href="product${p.id.replace('p', '')}.html" class="aspect-[4/5] bg-gray-50 overflow-hidden relative block w-full group-hover:bg-gray-100 transition-colors">
                    <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                    
                    <!-- Quick Add Slide Up -->
                    <div class="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex justify-center z-20 bg-gradient-to-t from-black/20 to-transparent">
                        <button class="btn-add-cart w-full bg-white/95 backdrop-blur text-primaryDark font-bold py-3 rounded-xl hover:bg-primary hover:text-white transition-all shadow-xl flex items-center justify-center gap-2" data-id="${p.id}">
                            <i class="ph-fill ph-shopping-bag pointer-events-none text-lg"></i> Quick Add
                        </button>
                    </div>
                </a>
                
                <div class="p-5 flex-1 flex flex-col bg-white">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-bold text-lg text-primaryDark line-clamp-1 pr-2">
                            <a href="product${p.id.replace('p', '')}.html" class="hover:text-accent transition-colors">${p.title}</a>
                        </h3>
                    </div>
                    
                    <p class="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">${p.desc}</p>
                    
                    <div class="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                        <span class="font-black text-xl text-primaryDark">Rp ${p.price.toLocaleString('id-ID')}</span>
                        <div class="bg-gray-50 text-gray-400 p-2 rounded-full flex items-center justify-center pointer-events-none text-xs border border-gray-100 group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                            <i class="ph-fill ph-star text-sm"></i>
                        </div>
                    </div>
                </div>
            `;
            productGrid.appendChild(card);
        });

        // Delegate click events for dynamically generated carts
        productGrid.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const pid = e.currentTarget.getAttribute('data-id');
                const productData = allProducts.find(item => item.id === pid);
                if (productData) {
                    addToCart(productData);
                }
            });
        });
    }

    // Init display
    updateCartUI();
});
