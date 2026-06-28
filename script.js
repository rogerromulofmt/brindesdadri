document.addEventListener('DOMContentLoaded', () => {
    // === Referências do DOM ===
    const waLink = document.getElementById('whatsapp-link');
    const overlay = document.getElementById('redirect-overlay');
    const fallbackContainer = document.getElementById('fallback-container');
    const fallbackButton = document.getElementById('fallback-button');
    const copyButton = document.getElementById('copy-link-button');
    const closeButton = document.getElementById('overlay-close');
    const overlayStatus = document.getElementById('overlay-status');
    const browserHint = document.getElementById('browser-hint');
    const copyInstruction = document.getElementById('copy-instruction');

    // === Detecção de Ambiente ===
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isAndroid = /android/i.test(ua);
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isTikTok = /musical_ly|TikTok|BytedanceWebview|ByteLocale/i.test(ua);
    const isInstagram = /Instagram/i.test(ua);
    const isFacebook = /FBAN|FBAV|FB_IAB/i.test(ua);
    const isInAppBrowser = isTikTok || isInstagram || isFacebook;

    // === URLs ===
    const groupCode = waLink.getAttribute('data-group');
    const standardUrl = `https://chat.whatsapp.com/${groupCode}`;
    const intentUrl = `intent://chat.whatsapp.com/${groupCode}#Intent;package=com.whatsapp;scheme=https;end`;

    // Define o href do botão de fallback
    if (fallbackButton) {
        fallbackButton.href = standardUrl;
    }

    // === Debounce para evitar duplo clique ===
    let isProcessing = false;

    // === Funções Utilitárias ===

    /** Mostra o container de fallback com animação suave */
    const showFallback = () => {
        if (!fallbackContainer) return;
        fallbackContainer.style.display = 'flex';
        // Pequeno delay para o display:flex aplicar antes da transição de opacidade
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                fallbackContainer.style.opacity = '1';
            });
        });

        // Mostra dica contextual do navegador
        showBrowserHint();
    };

    /** Esconde o overlay e reseta os estados */
    const hideOverlay = () => {
        overlay.classList.add('hidden');
        isProcessing = false;
        // Reseta após a animação de saída
        setTimeout(() => {
            if (fallbackContainer) {
                fallbackContainer.style.display = 'none';
                fallbackContainer.style.opacity = '0';
            }
            if (overlayStatus) {
                overlayStatus.textContent = 'Redirecionando para o WhatsApp...';
            }
            if (browserHint) {
                browserHint.classList.remove('visible');
            }
            if (copyInstruction) {
                copyInstruction.classList.remove('visible');
            }
        }, 300);
    };

    /** Mostra dica contextual baseada no app detectado */
    const showBrowserHint = () => {
        if (!browserHint || !isInAppBrowser) return;

        let hintText = '';
        if (isTikTok) {
            hintText = isIOS
                ? '💡 Dica: Toque em ⋯ no canto superior e depois em "Abrir no Safari"'
                : '💡 Dica: Toque em ⋮ no canto superior e depois em "Abrir no navegador"';
        } else if (isInstagram) {
            hintText = isIOS
                ? '💡 Dica: Toque em ⋯ no canto inferior e depois em "Abrir no Safari"'
                : '💡 Dica: Toque em ⋮ no canto superior e depois em "Abrir no navegador"';
        } else if (isFacebook) {
            hintText = '💡 Dica: Toque em ⋯ e depois em "Abrir no navegador"';
        }

        if (hintText) {
            browserHint.textContent = hintText;
            browserHint.classList.add('visible');
        }
    };

    /** Copia o link para a área de transferência */
    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(standardUrl);
            onCopySuccess();
        } catch {
            // Fallback para navegadores antigos / webviews restritivos
            const textarea = document.createElement('textarea');
            textarea.value = standardUrl;
            textarea.setAttribute('readonly', '');
            textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
            document.body.appendChild(textarea);
            textarea.select();
            textarea.setSelectionRange(0, 99999); // Para mobile
            try {
                document.execCommand('copy');
                onCopySuccess();
            } catch {
                // Se nem o fallback funcionar, mostra o link para copiar manualmente
                if (overlayStatus) {
                    overlayStatus.textContent = 'Copie o link manualmente:';
                }
                textarea.style.cssText = '';
                textarea.style.width = '80%';
                textarea.style.marginTop = '1rem';
                textarea.style.padding = '0.5rem';
                textarea.style.borderRadius = '8px';
                textarea.style.border = '1px solid rgba(255,255,255,0.3)';
                textarea.style.background = 'rgba(0,0,0,0.5)';
                textarea.style.color = '#fff';
                textarea.style.textAlign = 'center';
                textarea.style.fontSize = '0.8rem';
                fallbackContainer.appendChild(textarea);
                return; // Não remove o textarea
            }
            document.body.removeChild(textarea);
        }
    };

    /** Feedback visual de cópia bem-sucedida */
    const onCopySuccess = () => {
        if (!copyButton) return;
        copyButton.innerHTML = '✅ Link copiado!';
        copyButton.classList.add('copied');

        // Mostra instrução contextual
        if (copyInstruction) {
            copyInstruction.classList.add('visible');
        }

        setTimeout(() => {
            copyButton.innerHTML = '<i class="ph ph-copy"></i> COPIAR LINK DO GRUPO';
            copyButton.classList.remove('copied');
        }, 3000);
    };

    // === Event Listeners ===

    // Botão fechar overlay
    if (closeButton) {
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            hideOverlay();
        });
    }

    // Botão copiar link
    if (copyButton) {
        copyButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            copyLink();
        });
    }

    // Page Visibility API — detecta quando o usuário volta para a página
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && !overlay.classList.contains('hidden')) {
            // O usuário voltou (ex: apertou voltar no WhatsApp, ou grupo cheio)
            showFallback();
            if (overlayStatus) {
                overlayStatus.textContent = 'Não conseguiu entrar? Use as opções abaixo:';
            }
        }
    });

    // === Handler Principal ===
    waLink.addEventListener('click', (e) => {
        e.preventDefault();

        // Debounce — evita duplo clique
        if (isProcessing) return;
        isProcessing = true;

        // Mostra overlay
        overlay.classList.remove('hidden');

        // Reseta estados
        if (fallbackContainer) {
            fallbackContainer.style.display = 'none';
            fallbackContainer.style.opacity = '0';
        }
        if (overlayStatus) {
            overlayStatus.textContent = 'Redirecionando para o WhatsApp...';
        }
        if (browserHint) {
            browserHint.classList.remove('visible');
        }

        // Pequeno delay para a animação do overlay iniciar
        setTimeout(() => {
            if (isAndroid) {
                // ===== ESTRATÉGIA ANDROID =====
                // 1. Tenta intent:// (força abrir app WhatsApp, bypassa webview)
                window.location.href = intentUrl;

                // 2. Se ainda estiver aqui após 2.5s, tenta URL padrão + mostra fallback
                setTimeout(() => {
                    window.location.href = standardUrl;
                    showFallback();
                }, 2500);

            } else if (isIOS && isInAppBrowser) {
                // ===== ESTRATÉGIA iOS EM WEBVIEW (TikTok/Instagram) =====
                // Universal Links NÃO funcionam via window.location.href em webviews.
                // window.open com _blank tenta forçar abertura no Safari externo.
                window.open(standardUrl, '_blank');

                // Se ainda estiver aqui, mostra fallback rapidamente
                setTimeout(() => {
                    showFallback();
                }, 1500);

            } else if (isIOS) {
                // ===== ESTRATÉGIA iOS SAFARI NORMAL =====
                // Universal Links funcionam nativamente no Safari
                window.location.href = standardUrl;

                setTimeout(() => {
                    showFallback();
                }, 2500);

            } else {
                // ===== DESKTOP =====
                window.open(standardUrl, '_blank');

                setTimeout(() => {
                    showFallback();
                }, 1500);
            }
        }, 300);
    });
});
