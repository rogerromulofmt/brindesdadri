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

    function fallbackCopy(text, callback) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            if (callback) callback();
        } catch (err) {
            console.error('Falha ao copiar:', err);
        }
        document.body.removeChild(textArea);
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
                if (!str) return '';
                const p = document.createElement("p");
                p.appendChild(document.createTextNode(str));
                return p.innerHTML;
            };

            const nomeSeguro = escapeHTML(produto.nome ? produto.nome.toUpperCase() : '');
            const imagemSegura = encodeURI(produto.imagem); // links também podem conter XSS via javascript:
            const linkSeguro = encodeURI(produto.link);
            const temCupom = Boolean(produto.cupom && produto.cupom.trim());
            const cupomSeguro = temCupom ? escapeHTML(produto.cupom.trim()) : '';

            // Animação com delay em cascata
            const delayClass = `delay-${Math.min((index % 4) + 1, 4)}`; // Classes delay-1 a delay-4 disponíveis no CSS
            
            const card = document.createElement('div');
            card.className = `product-card fade-in-up ${delayClass}`;

            const cupomHTML = temCupom ? `
                <div class="product-coupon" data-coupon="${cupomSeguro}" title="Clique para copiar o cupom">
                    <div class="coupon-left">
                        <i class="ph ph-ticket coupon-icon"></i>
                        <span class="coupon-code">${cupomSeguro}</span>
                    </div>
                    <div class="coupon-action">
                        <span class="coupon-text">Copiar</span>
                        <i class="ph ph-copy copy-icon"></i>
                    </div>
                </div>
            ` : '';

            card.innerHTML = `
                <div class="product-image-container">
                    <img src="${imagemSegura}" alt="${nomeSeguro}" loading="lazy" onerror="this.onerror=null; this.src='https://placehold.co/400x400/2B0515/FFFFFF/png?text=Sem+Imagem'">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${nomeSeguro}</h3>
                    ${cupomHTML}
                    <div style="flex-grow: 1;"></div>
                    <a href="${linkSeguro}" target="_self" class="product-button">
                        Ver produto <i class="ph ph-arrow-right"></i>
                    </a>
                </div>
            `;

            // Evento de clique para copiar o cupom sem abrir o link do produto
            if (temCupom) {
                const couponEl = card.querySelector('.product-coupon');
                if (couponEl) {
                    couponEl.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        const code = couponEl.getAttribute('data-coupon');
                        if (!code) return;

                        const handleCopySuccess = () => {
                            couponEl.classList.add('copied');
                            const actionEl = couponEl.querySelector('.coupon-action');
                            if (actionEl) {
                                actionEl.innerHTML = `<span class="coupon-text">Copiado!</span><i class="ph ph-check copy-icon"></i>`;
                            }
                            setTimeout(() => {
                                couponEl.classList.remove('copied');
                                if (actionEl) {
                                    actionEl.innerHTML = `<span class="coupon-text">Copiar</span><i class="ph ph-copy copy-icon"></i>`;
                                }
                            }, 2000);
                        };

                        if (navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard.writeText(code)
                                .then(handleCopySuccess)
                                .catch(() => fallbackCopy(code, handleCopySuccess));
                        } else {
                            fallbackCopy(code, handleCopySuccess);
                        }
                    });
                }
            }

            produtosGrid.appendChild(card);
        });
    }
});
