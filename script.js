

(function () {
    'use strict';


    const STORAGE_TEMA = 'agrinho2026_tema';
    const STORAGE_FONTE = 'agrinho2026_fonte';
    const FONTE_PADRAO = 62.5; 
    const FONTE_MIN = 50;
    const FONTE_MAX = 80;
    const FONTE_PASSO = 5;

    let fonteAtual = FONTE_PADRAO;
    let temaAtual = 'claro';


    function $(seletor) {
        return document.querySelector(seletor);
    }

    function $$(seletor) {
        return document.querySelectorAll(seletor);
    }

    function salvarLocal(chave, valor) {
        try {
            localStorage.setItem(chave, valor);
        } catch (e) {
            
        }
    }

    function lerLocal(chave, padrao) {
        try {
            const v = localStorage.getItem(chave);
            return v !== null ? v : padrao;
        } catch (e) {
            return padrao;
        }
    }

    function initCanvasBolhas() {
        const canvas = $('#heroCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animacaoId;
        let largura = 0;
        let altura = 0;
        let bolhas = [];

        function redimensionar() {
            const pai = canvas.parentElement;
            largura = pai.clientWidth;
            altura = pai.clientHeight;
            canvas.width = largura;
            canvas.height = altura;
        }

        function criarBolha() {
            return {
                x: Math.random() * largura,
                y: altura + Math.random() * 100,
                raio: Math.random() * 4 + 1,
                velocidade: Math.random() * 1 + 0.3,
                opacidade: Math.random() * 0.5 + 0.1,
                oscilacao: Math.random() * 2 - 1,
                fase: Math.random() * Math.PI * 2
            };
        }

        function inicializarBolhas() {
            bolhas = [];
            const quantidade = Math.floor((largura * altura) / 15000);
            for (let i = 0; i < quantidade; i++) {
                const b = criarBolha();
                b.y = Math.random() * altura;
                bolhas.push(b);
            }
        }

        function desenhar() {
            ctx.clearRect(0, 0, largura, altura);

            for (const b of bolhas) {
                b.y -= b.velocidade;
                b.fase += 0.02;
                const x = b.x + Math.sin(b.fase) * b.oscilacao * 10;

                if (b.y + b.raio < 0) {
                    b.y = altura + b.raio;
                    b.x = Math.random() * largura;
                }

                ctx.beginPath();
                ctx.arc(x, b.y, b.raio, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(91, 192, 190, ${b.opacidade})`;
                ctx.fill();
            }

            animacaoId = requestAnimationFrame(desenhar);
        }

        redimensionar();
        inicializarBolhas();
        desenhar();

        window.addEventListener('resize', () => {
            redimensionar();
            inicializarBolhas();
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    if (!animacaoId) desenhar();
                } else {
                    cancelAnimationFrame(animacaoId);
                    animacaoId = null;
                }
            });
        }, { threshold: 0.1 });

        observer.observe(canvas);
    }

    function initNavegacao() {
        const btnHamburguer = $('#btnHamburguer');
        const navLinks = $('#navLinks');

        if (!btnHamburguer || !navLinks) return;

        btnHamburguer.addEventListener('click', () => {
            const aberto = navLinks.classList.toggle('aberto');
            btnHamburguer.classList.toggle('ativo');
            btnHamburguer.setAttribute('aria-expanded', String(aberto));
        });

        navLinks.querySelectorAll('.nav-link').forEach((link) => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('aberto');
                btnHamburguer.classList.remove('ativo');
                btnHamburguer.setAttribute('aria-expanded', 'false');
            });
        });
    }


    function initTema() {
        const btnTema = $('#btnTema');
        if (!btnTema) return;

        const temaSalvo = lerLocal(STORAGE_TEMA, 'claro');
        if (temaSalvo === 'escuro') {
            document.body.classList.add('modo-escuro');
            temaAtual = 'escuro';
        }

        btnTema.addEventListener('click', () => {
            document.body.classList.toggle('modo-escuro');
            temaAtual = document.body.classList.contains('modo-escuro') ? 'escuro' : 'claro';
            salvarLocal(STORAGE_TEMA, temaAtual);
        });
    }


    function initFonte() {
        const btnMais = $('#btnFonteMais');
        const btnMenos = $('#btnFonteMenos');
        if (!btnMais || !btnMenos) return;

        const fonteSalva = parseInt(lerLocal(STORAGE_FONTE, String(FONTE_PADRAO)), 10);
        if (!isNaN(fonteSalva)) {
            fonteAtual = Math.max(FONTE_MIN, Math.min(FONTE_MAX, fonteSalva));
            document.documentElement.style.fontSize = fonteAtual + '%';
        }

        function ajustar(delta) {
            const nova = fonteAtual + delta;
            if (nova < FONTE_MIN || nova > FONTE_MAX) return;
            fonteAtual = nova;
            document.documentElement.style.fontSize = fonteAtual + '%';
            salvarLocal(STORAGE_FONTE, String(fonteAtual));
        }

        btnMais.addEventListener('click', () => ajustar(FONTE_PASSO));
        btnMenos.addEventListener('click', () => ajustar(-FONTE_PASSO));
    }


    function initScrollAnimations() {
        const itens = document.querySelectorAll('.card, .timeline-item');
        if (!itens.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visivel');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        itens.forEach((item) => observer.observe(item));
    }


    function initContadores() {
        const contadores = document.querySelectorAll('.card-numero');
        if (!contadores.length) return;

        const duracao = 2000; 

        function animar(el) {
            const alvo = parseInt(el.getAttribute('data-alvo'), 10);
            if (isNaN(alvo)) return;

            const inicio = performance.now();

            function atualizar(tempo) {
                const decorrido = tempo - inicio;
                const progresso = Math.min(decorrido / duracao, 1);
                const eased = 1 - Math.pow(1 - progresso, 3); 
                const atual = Math.floor(eased * alvo);
                el.textContent = atual;

                if (progresso < 1) {
                    requestAnimationFrame(atualizar);
                } else {
                    el.textContent = alvo;
                }
            }

            requestAnimationFrame(atualizar);
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animar(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        contadores.forEach((c) => observer.observe(c));
    }

    function initTabsHidroponia() {
        const botoes = $$('.tab-btn');
        const paineis = $$('.tab-painel');
        if (!botoes.length) return;

        botoes.forEach((btn) => {
            btn.addEventListener('click', () => {
                const alvoId = btn.getAttribute('aria-controls');

                botoes.forEach((b) => {
                    b.classList.remove('ativo');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('ativo');
                btn.setAttribute('aria-selected', 'true');

                paineis.forEach((p) => {
                    p.classList.remove('ativo');
                    p.hidden = true;
                });

                const painelAlvo = $('#' + alvoId);
                if (painelAlvo) {
                    painelAlvo.classList.add('ativo');
                    painelAlvo.hidden = false;
                }
            });
        });
    }


    function initSimuladorAquaponia() {
        const etapas = $$('.ciclo-etapa');
        const descricao = $('#cicloDescricao');
        if (!etapas.length || !descricao) return;

        const textos = {
            peixes: 'Os peixes (como tilápias) produzem amônia através de suas excreções. Essa amônia, em alta concentração, é tóxica para os peixes, mas serve de matéria-prima para o próximo passo do ciclo.',
            bacterias: 'Bactérias nitrificantes naturais convertem a amônia em nitritos e, em seguida, em nitratos — um nutriente completo e seguro para as plantas absorverem.',
            plantas: 'As plantas (alface, manjericão, rúcula) absorvem os nitratos diretamente pela raiz, crescendo rápido e saudável sem necessidade de solo.',
            agua: 'Após passar pelas raízes, a água fica limpa e oxigenada, retornando ao tanque dos peixes. O ciclo se fecha: zero desperdício, máxima eficiência.'
        };

        etapas.forEach((etapa) => {
            etapa.addEventListener('click', () => {
                const chave = etapa.getAttribute('data-etapa');
                const texto = textos[chave];
                if (!texto) return;

                etapas.forEach((e) => e.classList.remove('ativo'));
                etapa.classList.add('ativo');

                descricao.style.opacity = '0';
                setTimeout(() => {
                    descricao.innerHTML = '<p class="ciclo-texto">' + texto + '</p>';
                    descricao.style.opacity = '1';
                }, 200);
            });
        });
    }


    function initCalculadora() {
        const form = $('#formCalculadora');
        const resultado = $('#resultadoCalculadora');
        if (!form || !resultado) return;

        const LITROS_TRADICIONAL_POR_METRO = 12000;

        form.addEventListener('submit', (evento) => {
            evento.preventDefault();

            const areaInput = $('#areaCultivo');
            const tipoInput = $('#tipoSistema');

            const area = parseFloat(areaInput.value);
            const tipo = tipoInput.value;

            if (isNaN(area) || area <= 0 || !tipo) {
                resultado.innerHTML = '<p class="resultado-padrao" style="color:#e74c3c">Por favor, preencha todos os campos corretamente.</p>';
                return;
            }

            const economiaPercentual = tipo === 'aquaponia' ? 0.95 : 0.90;
            const litrosTrad = area * LITROS_TRADICIONAL_POR_METRO;
            const litrosEco = litrosTrad * (1 - economiaPercentual);
            const litrosEcono = litrosTrad - litrosEco;

            const dados = {
                area: area,
                tipo: tipo === 'aquaponia' ? 'Aquaponia' : 'Hidroponia',
                economia: (economiaPercentual * 100).toFixed(0),
                trad: litrosTrad.toLocaleString('pt-BR'),
                eco: litrosEco.toLocaleString('pt-BR'),
                econo: litrosEcono.toLocaleString('pt-BR')
            };

            const htmlResultado = `
                <div class="resultado-dados">
                    <div class="resultado-item">
                        <span>Área informada</span>
                        <strong>${dados.area} m²</strong>
                    </div>
                    <div class="resultado-item">
                        <span>Sistema escolhido</span>
                        <strong>${dados.tipo}</strong>
                    </div>
                    <div class="resultado-item">
                        <span>Economia estimada</span>
                        <strong>${dados.economia}%</strong>
                    </div>
                    <div class="resultado-item">
                        <span>Consumo tradicional/ano</span>
                        <strong>${dados.trad} L</strong>
                    </div>
                    <div class="resultado-item">
                        <span>Consumo sem solo/ano</span>
                        <strong>${dados.eco} L</strong>
                    </div>
                    <div class="resultado-item">
                        <span class="resultado-destaque resultado-destaque-laranja">Água economizada</span>
                        <span class="resultado-destaque">${dados.econo} L</span>
                    </div>
                </div>
            `;

            resultado.innerHTML = htmlResultado;
            resultado.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }

    function initScrollSpy() {
        const secoes = $$('.secao[id]');
        const links = $$('.nav-link[href^="#"]');
        if (!secoes.length || !links.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    links.forEach((link) => {
                        link.classList.remove('ativo-scroll');
                        if (link.getAttribute('href') === '#' + id) {
                            link.classList.add('ativo-scroll');
                        }
                    });
                }
            });
        }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

        secoes.forEach((secao) => observer.observe(secao));
    }

    function init() {
        initCanvasBolhas();
        initNavegacao();
        initTema();
        initFonte();
        initScrollAnimations();
        initContadores();
        initTabsHidroponia();
        initSimuladorAquaponia();
        initCalculadora();
        initScrollSpy();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
