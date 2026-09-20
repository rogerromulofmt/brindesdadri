document.addEventListener('DOMContentLoaded', () => {
    const produtosGrid = document.getElementById('produtos-grid');
    let allProducts = []; // Armazena a lista completa para o filtro

    // Fetch JSON data com timestamp para evitar cache no GitHub Pages durante a edição
    fetch(`data/produtos.json?t=${new Date().getTime()}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar produtos');
            }
            return response.json();
        })
        .then(produtos => {
            allProducts = produtos;
            renderProdutos(produtos);
            setupSearch();
        })
        .catch(error => {
            console.error('Erro:', error);
            produtosGrid.innerHTML = `
                <div style="text-align: center; padding: 2rem; width: 100%; grid-column: 1 / -1;">
                    <i class="ph ph-warning-circle" style="font-size: 3rem; color: #E52E71; margin-bottom: 1rem;"></i>
                    <p style="color: rgba(255,255,255,0.8); font-size: 0.95rem;">
                        Não foi possível carregar os produtos no momento.<br>Tente novamente mais tarde.
                    </p>
                </div>`;
        });

    function setupSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase();
            const filtrados = allProducts.filter(p => p.nome.toLowerCase().includes(termo));
            renderProdutos(filtrados);
        });
    }

    function renderProdutos(produtos) {
        produtosGrid.innerHTML = ''; // Clear loading

        if (produtos.length === 0) {
            const termo = document.getElementById('searchInput')?.value || '';
            const msg = termo 
                ? `Nenhum produto encontrado para "<b>${termo}</b>"` 
                : 'Nenhuma oferta disponível no momento. Volte em breve!';
                
            produtosGrid.innerHTML = `
                <div style="text-align: center; padding: 2rem; width: 100%; grid-column: 1 / -1;">
                    <p style="color: rgba(255,255,255,0.7); font-size: 0.95rem;">${msg}</p>
                </div>`;
            return;
        }

        produtos.forEach((produto, index) => {
            // Função simples para sanitizar HTML (Prevenção XSS)
            const escapeHTML = (str) => {
                const p = document.createElement("p");
                p.appendChild(document.createTextNode(str));
                return p.innerHTML;
            };

            const nomeSeguro = escapeHTML(produto.nome);
            const imagemSegura = encodeURI(produto.imagem); // links também podem conter XSS via javascript:
            const linkSeguro = encodeURI(produto.link);

            // Animação com delay em cascata
            const delayClass = `delay-${Math.min((index % 4) + 1, 4)}`; // Classes delay-1 a delay-4 disponíveis no CSS
            
            const card = document.createElement('a');
            card.href = linkSeguro;
            card.className = `product-card fade-in-up ${delayClass}`;

            card.innerHTML = `
                <div class="product-image-container">
                    <img src="${imagemSegura}" alt="${nomeSeguro}" loading="lazy" onerror="this.onerror=null; this.src='https://placehold.co/400x400/2B0515/FFFFFF/png?text=Sem+Imagem'">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${nomeSeguro}</h3>
                    <div style="flex-grow: 1;"></div>
                    <div class="product-button">
                        Ver produto <i class="ph ph-arrow-right"></i>
                    </div>
                </div>
            `;

            produtosGrid.appendChild(card);
        });
    }
});
