const API_URL = 'http://localhost:3001';

const params = new URLSearchParams(window.location.search);
const slug = params.get('pagina');

function el(tag, className, texto) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (texto !== undefined) e.textContent = texto;
    return e;
}

function criarComentario(c) {
    const article = el('article', 'review-card');
    article.appendChild(document.createElement('hr'));

    const foto = el('div', 'review-photo');
    const img = document.createElement('img');
    img.src = 'assets/person.jpeg';
    img.alt = 'foto do usuário';
    foto.appendChild(img);

    const nomeBox = el('div', 'review-nome-estrela-inline');
    const divNome = document.createElement('div');
    divNome.appendChild(el('h3', 'titulo', c.autor ? c.autor.nome : 'Usuário removido'));
    nomeBox.appendChild(divNome);

    const divTexto = document.createElement('div');
    divTexto.appendChild(el('p', 'comentario', c.comentario));

    article.append(foto, nomeBox, divTexto);
    return article;
}

function criarRecomendacao(p) {
    const link = document.createElement('a');
    link.href = `truck_page.html?pagina=${encodeURIComponent(p.slug)}`;

    const card = el('div', 'destaque-card');

    const divImg = document.createElement('div');
    const img = el('img', 'destaque-card-img');
    img.src = p.imagem;
    img.alt = p.titulo;
    divImg.appendChild(img);

    const divTitulo = document.createElement('div');
    divTitulo.appendChild(el('h3', null, p.titulo));

    card.append(divImg, divTitulo);
    link.appendChild(card);
    return link;
}

function preencherPagina(p) {
    document.title = `Truck Place | ${p.titulo}`;
    document.getElementById('ft-titulo').textContent = p.titulo;
    document.getElementById('ft-desc').textContent = p.descricao;
    document.getElementById('ft-oferece').textContent = p.oferece;
    document.getElementById('ft-horario').textContent = p.horario;
    document.getElementById('ft-local').textContent = p.local;

    const img = document.getElementById('ft-img');
    img.src = p.imagem;
    img.alt = p.titulo;

    document.getElementById('ft-mapa').src = p.mapa;
}

function preencherComentarios(lista) {
    const area = document.getElementById('comment-box-area');
    area.textContent = '';

    if (lista.length === 0) {
        area.appendChild(el('p', null, 'Seja o primeiro a comentar.'));
        return;
    }
    lista.forEach((c) => area.appendChild(criarComentario(c)));
}

function preencherRecomendacoes(lista) {
    const area = document.getElementById('ft-recomendacoes');
    area.textContent = '';
    lista
        .filter((p) => p.slug !== slug)
        .slice(0, 3)
        .forEach((p) => area.appendChild(criarRecomendacao(p)));
}

async function carregarDetalhes() {
    if (!slug) {
        document.getElementById('ft-titulo').textContent = 'Página não informada';
        return;
    }

    try {
        const slugUrl = encodeURIComponent(slug);

        const [resPagina, resComentarios, resTodas] = await Promise.all([
            fetch(`${API_URL}/paginas/${slugUrl}`),
            fetch(`${API_URL}/comentarios/${slugUrl}`),
            fetch(`${API_URL}/paginas`)
        ]);

        if (resPagina.status === 404) {
            document.getElementById('ft-titulo').textContent = 'Food truck não encontrado';
            return;
        }
        if (!resPagina.ok) throw new Error('Falha ao buscar a página');

        preencherPagina(await resPagina.json());

        if (resComentarios.ok) preencherComentarios(await resComentarios.json());
        if (resTodas.ok) preencherRecomendacoes(await resTodas.json());
    } catch (err) {
        document.getElementById('ft-titulo').textContent = 'Erro ao carregar a página';
    }
}

carregarDetalhes();