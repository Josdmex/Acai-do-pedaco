/* ==========================================================================
   1. VARIÁVEIS GERAIS E CONFIGURAÇÕES
   ========================================================================== */
let carrinho = [];
let total = 0;
let timeoutTexto; // Variável para controlar o tempo do texto "Ver sacola"

// Variáveis para o Builder (Personalização)
let produtoAtualBuilder = {};
let totalBuilder = 0;

// SEU NÚMERO AQUI
const numeroLoja = '5564999331758'; 

/* ==========================================================================
   2. FUNÇÕES DO CARRINHO (ADICIONAR/REMOVER)
   ========================================================================== */

// Adicionar item ao carrinho (Agora aceita origem 'builder' para não dar erro no botão)
function adicionarAoCarrinho(nome, preco, origem = 'direto') {
    // Adiciona ao array
    carrinho.push({ nome, preco });
    total += preco;
    
    // Atualiza a tela (Barra flutuante e contadores)
    atualizarBarraCarrinho();
    
    // EFEITO VISUAL (Só acontece se clicar direto no botão do card, não pelo builder)
    if (origem === 'direto' && event) {
        const btn = event.currentTarget;
        const originalContent = btn.innerHTML; // Guarda o ícone de +
        
        btn.innerHTML = '<i class="fas fa-check"></i>';
        btn.style.backgroundColor = '#00C853'; // Verde
        btn.style.color = '#fff';
        btn.style.transform = 'scale(1.1)'; // Pulsar
        
        // Volta ao normal depois de 1 segundo
        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.style.backgroundColor = ''; 
            btn.style.color = '';
            btn.style.transform = 'scale(1)';
        }, 1000);
    }
}

// Atualizar contadores e a barra flutuante (Sua lógica original mantida)
function atualizarBarraCarrinho() {
    const barra = document.getElementById('barra-carrinho');
    const contadorBarra = document.getElementById('contador-itens');
    const valorTotal = document.getElementById('valor-total');
    const textoMeio = document.querySelector('.cart-center'); 
    
    // 1. Atualiza valores da barra inferior
    if (contadorBarra) contadorBarra.innerText = carrinho.length;
    if (valorTotal) valorTotal.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;

    // 2. Atualiza o contador da Navbar (Lá em cima)
    const contadorNav = document.getElementById('contador-itens-nav');
    if (contadorNav) {
        contadorNav.innerText = carrinho.length;
        // Efeito "Pulsar" na bolinha vermelha
        contadorNav.style.transform = 'scale(1.5)';
        setTimeout(() => {
            contadorNav.style.transform = 'scale(1)';
        }, 200);
    }

    // 3. Lógica da Barra Flutuante (Aparecer e Sumir Texto)
    if (carrinho.length > 0 && barra) {
        barra.classList.add('visible');
        
        // Mostra o texto "Ver minha sacola"
        if (textoMeio) {
            textoMeio.classList.remove('sumir');

            // Limpa o timer anterior se o cliente clicar rápido
            clearTimeout(timeoutTexto);

            // Agenda para o texto sumir daqui a 3 segundos
            timeoutTexto = setTimeout(() => {
                textoMeio.classList.add('sumir');
            }, 3000);
        }
    } else if (barra) {
        barra.classList.remove('visible');
    }
}

// Remover Item Individualmente
function removerItem(index) {
    total -= carrinho[index].preco;
    carrinho.splice(index, 1);
    
    atualizarBarraCarrinho();
    
    // Se ainda tiver itens, recarrega o modal. Se não, fecha.
    if (carrinho.length > 0) {
        abrirModalCarrinho(); 
    } else {
        fecharModalCarrinho();
        document.getElementById('barra-carrinho').classList.remove('visible');
    }
}

/* ==========================================================================
   3. MODAL DE CHECKOUT (CARRINHO FINAL)
   ========================================================================== */

function abrirModalCarrinho() {
    const modal = document.getElementById('modal-checkout');
    const listaItens = document.getElementById('lista-itens');
    const totalModal = document.getElementById('total-modal');

    if (carrinho.length === 0) {
        alert("Sua sacola está vazia! Adicione um açaí primeiro. 💜");
        return;
    }

    // Limpa a lista antes de renderizar
    listaItens.innerHTML = '';

    carrinho.forEach((item, index) => {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
            <span class="cart-item-name">${item.nome}</span>
            <div style="display:flex; align-items:center; gap:10px;">
                <span class="cart-item-price">R$ ${item.preco.toFixed(2).replace('.', ',')}</span>
                <button onclick="removerItem(${index})" style="background:none; border:none; color:#ff4444; cursor:pointer; font-size:1rem;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        listaItens.appendChild(div);
    });

    totalModal.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden'; // Trava o scroll do site
}

function fecharModalCarrinho() {
    document.getElementById('modal-checkout').classList.remove('open');
    document.body.style.overflow = 'auto'; // Destrava o scroll
}

// Fechar modal ao clicar fora dele
const modalOverlayCheckout = document.getElementById('modal-checkout');
if (modalOverlayCheckout) {
    modalOverlayCheckout.addEventListener('click', function(e) {
        if (e.target === this) {
            fecharModalCarrinho();
        }
    });
}

/* ==========================================================================
   4. LÓGICA DO BUILDER (PERSONALIZAÇÃO - NOVO CÓDIGO)
   ========================================================================== */

function abrirPersonalizacao(nome, precoBase, imagemUrl) {
    // 1. Salva os dados do produto clicado
    produtoAtualBuilder = {
        nome: nome,
        precoBase: precoBase,
        imagem: imagemUrl
    };

    // 2. Reseta o Modal (Limpa seleções anteriores)
    document.getElementById('builder-titulo').innerText = nome;
    document.getElementById('builder-foto-real').src = imagemUrl;
    
    // Desmarca todos os checkboxes
    document.querySelectorAll('.opcao-card input').forEach(input => {
        input.checked = false;
    });

    // Esconde todas as camadas de ingredientes no copo
    document.querySelectorAll('.camada.ingrediente').forEach(img => {
        img.classList.remove('visivel');
    });

    // 3. Abre o Modal
    const modal = document.getElementById('modal-personalizar');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden'; // Trava scroll
    
    atualizarPrecoBuilder();
}

function fecharPersonalizacao() {
    document.getElementById('modal-personalizar').classList.remove('open');
    document.body.style.overflow = 'auto'; // Destrava scroll
}

// Função chamada ao clicar num ingrediente
function toggleCamada(idLayer) {
    // Pequeno delay para dar tempo do checkbox mudar de estado
    setTimeout(() => {
        atualizarCamadasVisuais();
        atualizarPrecoBuilder();
    }, 50);
}

// Sincroniza os Checkboxes com as Imagens (Camadas)
function atualizarCamadasVisuais() {
    // Mapa: Nome do Checkbox -> ARRAY DE IDs DAS IMAGENS
    // Agora aceita várias camadas para o mesmo ingrediente!
    const map = {
        'Banana': ['layer-banana-1', 'layer-banana-2'],   // Duas camadas
        'Morango': ['layer-morango-1', 'layer-morango-2'], // Duas camadas
        'Leite Condensado': ['layer-leitecondensado'],
        'Granola': ['layer-granola'],
        'Leite em Pó': ['layer-leitepo'],
    };

    // 1. Mostra quem está marcado
    document.querySelectorAll('.opcao-card input:checked').forEach(input => {
        const idsLayers = map[input.value];
        if(idsLayers) {
            // Percorre todas as IDs daquele ingrediente e liga elas
            idsLayers.forEach(id => {
                const el = document.getElementById(id);
                if(el) el.classList.add('visivel');
            });
        }
    });

    // 2. Esconde quem NÃO está marcado
    document.querySelectorAll('.opcao-card input:not(:checked)').forEach(input => {
        const idsLayers = map[input.value];
        if(idsLayers) {
            // Percorre todas as IDs daquele ingrediente e desliga elas
            idsLayers.forEach(id => {
                const el = document.getElementById(id);
                if(el) el.classList.remove('visivel');
            });
        }
    });
}

// Calcula preço dentro do modal
function atualizarPrecoBuilder() {
    let precoTotal = produtoAtualBuilder.precoBase;
    
    // Soma os adicionais marcados
    document.querySelectorAll('.opcao-card input:checked').forEach(input => {
        let precoAdd = parseFloat(input.getAttribute('data-preco'));
        precoTotal += precoAdd;
    });

    totalBuilder = precoTotal;
    document.getElementById('builder-total').innerText = "R$ " + precoTotal.toFixed(2).replace('.', ',');
}

// Botão FINALIZAR do Modal de Personalização
function confirmarPersonalizacao() {
    // Monta o nome final (Ex: Copo 500ml com: Banana, Paçoca)
    let adicionais = [];
    document.querySelectorAll('.opcao-card input:checked').forEach(input => {
        adicionais.push(input.value);
    });

    let nomeFinal = produtoAtualBuilder.nome;
    if (adicionais.length > 0) {
        nomeFinal += " com: " + adicionais.join(", ");
    }

    // Manda pro carrinho usando a função principal, mas avisando que veio do 'builder'
    adicionarAoCarrinho(nomeFinal, totalBuilder, 'builder');
    
    // Fecha o modal
    fecharPersonalizacao();
}

/* ==========================================================================
   5. INTEGRAÇÕES (WHATSAPP E MENU)
   ========================================================================== */

// Enviar Pedido para o WhatsApp
function enviarPedidoZap() {
    const nome = document.getElementById('nome-cliente').value;
    const endereco = document.getElementById('endereco-cliente').value;
    const pagamento = document.getElementById('pagamento-cliente').value;

    if (nome === '' || endereco === '' || pagamento === '') {
        alert('Por favor, preencha todos os dados para a entrega!');
        return;
    }

    let mensagem = `*🟣 NOVO PEDIDO - AÇAÍ SPACE*\n\n`;
    mensagem += `*👤 Cliente:* ${nome}\n`;
    mensagem += `*📍 Endereço:* ${endereco}\n`;
    mensagem += `*💳 Pagamento:* ${pagamento}\n\n`;
    mensagem += `*🧾 ITENS DO PEDIDO*\n`;
    mensagem += `------------------------------\n`;

    carrinho.forEach(item => {
        // Item agora pode ter um nome longo (com adicionais)
        mensagem += `▪️ 1x ${item.nome}\n   R$ ${item.preco.toFixed(2).replace('.', ',')}\n`;
    });

    mensagem += `------------------------------\n`;
    mensagem += `*💰 TOTAL: R$ ${total.toFixed(2).replace('.', ',')}*\n\n`;
    mensagem += `Aguardo a confirmação! 🚀`;

    const url = `https://api.whatsapp.com/send?phone=${numeroLoja}&text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
}

// Menu Mobile
function toggleMenu() {
    const nav = document.querySelector('.nav-links');
    const menuIcon = document.querySelector('.menu-toggle');
    nav.classList.toggle('active');
    menuIcon.classList.toggle('active');
}

// Fechar menu ao clicar no link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.nav-links').classList.remove('active');
        document.querySelector('.menu-toggle').classList.remove('active');
    });
});

/* ==========================================================================
   6. FILTRO DO CARDÁPIO E PESQUISA
   ========================================================================== */
function filtrarMenu(categoria, botaoClicado) {
    // 1. Tira a cor roxa (classe 'active') de todos os botões
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 2. Coloca a cor roxa só no botão que o cliente clicou
    botaoClicado.classList.add('active');

    // 3. Pega todos os açaís do site
    const produtos = document.querySelectorAll('.product-card');

    // 4. Verifica um por um
    produtos.forEach(produto => {
        // Pega a etiqueta (data-categoria) que colocamos no HTML
        const categoriaProduto = produto.getAttribute('data-categoria');

        // Se clicou em "todos" ou se a categoria bate com a do botão...
        if (categoria === 'todos' || categoria === categoriaProduto) {
            produto.classList.remove('escondido'); // Mostra na tela
        } else {
            produto.classList.add('escondido'); // Esconde da tela
        }
    });
}

// SISTEMA DE PESQUISA EM TEMPO REAL
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const produtos = document.querySelectorAll('.product-card');

    searchInput.addEventListener('input', function() {
        const termoDigitado = this.value.toLowerCase().trim();

        produtos.forEach(produto => {
            // Pega o nome do produto (que tá no H3)
            const nomeProduto = produto.querySelector('.product-info h3').textContent.toLowerCase();
            
            // Se o nome incluir o que o cara digitou, mostra. Se não, esconde.
            if (nomeProduto.includes(termoDigitado)) {
                produto.classList.remove('escondido');
            } else {
                produto.classList.add('escondido');
            }
        });
    });
});

/* ==========================================================================
   7. MOTOR DE ARRASTO (DRAG), LOOP E CARD 3D (UPZEN)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('carouselFavoritos');
    if (!slider) return;

    // 1. Clonagem Inteligente para Loop Infinito
    const items = Array.from(slider.children);
    // Multiplica pra dar volume na tela
    while (slider.children.length < 10) {
        items.forEach(item => slider.appendChild(item.cloneNode(true)));
    }
    // Clona a fila inteira final pro loop
    Array.from(slider.children).forEach(item => slider.appendChild(item.cloneNode(true)));

    // 2. Variáveis de Física (Arrasto)
    let isDown = false;
    let startX;
    let scrollLeft;
    let isDragging = false; // Identifica se foi clique ou arrasto
    let animationId;

    // 3. Motor de Auto-Play (Giro Automático)
    function playCarousel() {
        slider.scrollLeft += 1; // Velocidade (1 pixel por frame)
        
        // Se chegou na emenda dos clones, reseta invisível pro início
        if (slider.scrollLeft >= slider.scrollWidth / 2) {
            slider.scrollLeft = 0;
        }
        animationId = requestAnimationFrame(playCarousel);
    }

    // Liga o motor assim que carrega
    playCarousel();

    // 4. Lógica de Arrastar com Mouse (PC)
    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        isDragging = false; 
        slider.classList.add('active');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
        cancelAnimationFrame(animationId); // Pausa o motor automático
    });

    slider.addEventListener('mouseleave', () => {
        if(!isDown) return;
        isDown = false;
        slider.classList.remove('active');
        playCarousel(); // Soltou fora, liga o motor de novo
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('active');
        playCarousel(); // Soltou o clique, liga o motor
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        isDragging = true; // Confirmou que arrastou a tela
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 1.5; // Multiplicador da velocidade da sua mão
        slider.scrollLeft = scrollLeft - walk;
    });

    // 5. Lógica de Arrastar com Dedo (Celular)
    slider.addEventListener('touchstart', (e) => {
        isDown = true;
        isDragging = false;
        startX = e.touches[0].pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
        cancelAnimationFrame(animationId);
    }, {passive: true});

    slider.addEventListener('touchend', () => {
        isDown = false;
        playCarousel();
    });

    slider.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        isDragging = true;
        const x = e.touches[0].pageX - slider.offsetLeft;
        const walk = (x - startX) * 1.5;
        slider.scrollLeft = scrollLeft - walk;
    }, {passive: true});

    // ==========================================
    // LÓGICA DO CARD 3D (VIRAR E COMPRAR)
    // ==========================================
    window.virarCard = function(card, event) {
        // Se o cara tava arrastando a tela, cancela a ação pra não virar o card sem querer!
        if (isDragging) return;

        // Vira a carta atual
        card.classList.toggle('flipped');
        
        // Desvira os outros cards que estiverem abertos pra ficar limpo
        document.querySelectorAll('.favorito-card').forEach(c => {
            if (c !== card) c.classList.remove('flipped');
        });
    };

    window.acionarProduto = function(event, btn) {
        // Impede que o clique no botão do verso vire a carta de volta pra frente!
        event.stopPropagation(); 
        
        // Pega o card pai e puxa as etiquetas (data-) pra saber o que adicionar
        const card = btn.closest('.favorito-card');
        const tipo = card.getAttribute('data-tipo');
        const nome = card.getAttribute('data-nome');
        const preco = parseFloat(card.getAttribute('data-preco'));
        const img = card.getAttribute('data-img');

        // Se for um produto com adicionais, abre o modal mágico. Se não, joga direto na sacola.
        if (tipo === 'personalizar') {
            abrirPersonalizacao(nome, preco, img);
        } else {
            adicionarAoCarrinho(nome, preco);
        }
    };
});