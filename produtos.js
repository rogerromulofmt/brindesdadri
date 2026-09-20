document.addEventListener('DOMContentLoaded', () => {
    const produtosGrid = document.getElementById('produtos-grid');

    // Fetch JSON data com timestamp para evitar cache no GitHub Pages durante a edição
    fetch(`data/produtos.json?t=${new Date().getTime()}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar produtos');
            }
            return response.json();
        })
        .then(produtos => {
            renderProdutos(produtos);
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

    function renderProdutos(produtos) {
        produtosGrid.innerHTML = ''; // Clear loading

        if (produtos.length === 0) {
            produtosGrid.innerHTML = `
                <div style="text-align: center; padding: 2rem; width: 100%; grid-column: 1 / -1;">
                    <p style="color: rgba(255,255,255,0.7); font-size: 0.95rem;">Nenhuma oferta disponível no momento. Volte em breve!</p>
                </div>`;
            return;
        }

        produtos.forEach((produto, index) => {
            // Animação com delay em cascata
            const delayClass = `delay-${Math.min((index % 4) + 1, 4)}`; // Classes delay-1 a delay-4 disponíveis no CSS
            
            const card = document.createElement('a');
            card.href = produto.link;
            card.target = '_blank';
            card.rel = 'noopener noreferrer';
            card.className = `product-card fade-in-up ${delayClass}`;

            // Fallback de imagem caso dê erro
            const handleImageError = `this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23ffffff20"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23ffffff80">Sem Imagem</text></svg>';`;

            card.innerHTML = `
                <div class="product-image-container">
                    <img src="${produto.imagem}" alt="${produto.nome}" loading="lazy" onerror="${handleImageError}">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${produto.nome}</h3>
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
