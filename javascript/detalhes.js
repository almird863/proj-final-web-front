
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
    article.dataset.id = c._id;
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

    // Botões só para o dono do comentário
    const usuario = getUsuario();
    const ehDono = estaLogado() && c.autor && usuario && c.autor._id === usuario.id;

    if (ehDono) {
        const acoes = el('div', 'review-acoes');

        const btnEditar = el('button', 'btn-editar', 'Editar');
        btnEditar.type = 'button';
        btnEditar.addEventListener('click', () => iniciarEdicao(article, c));

        const btnDeletar = el('button', 'btn-deletar', 'Deletar');
        btnDeletar.type = 'button';
        btnDeletar.addEventListener('click', () => deletarComentario(article, c._id));

        acoes.append(btnEditar, btnDeletar);
        article.appendChild(acoes);
    }

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

async function deletarComentario(article, id) {
    if (!confirm('Deseja realmente deletar este comentário?')) return;

    try {
        const resposta = await fetchAutenticado(`${API_URL}/comentarios/${id}`, {
            method: 'DELETE'
        });

        if (!resposta.ok) {
            const dados = await resposta.json();
            alert(dados.message || 'Não foi possível deletar.');
            return;
        }

        article.remove();

        const area = document.getElementById('comment-box-area');
        if (!area.querySelector('.review-card')) {
            area.appendChild(el('p', 'sem-comentarios', 'Seja o primeiro a comentar.'));
        }
    } catch (err) {
        alert('Erro de conexão com o servidor.');
    }
}

function iniciarEdicao(article, c) {
    const pTexto = article.querySelector('.comentario');
    const acoes = article.querySelector('.review-acoes');

    const campo = document.createElement('input');
    campo.type = 'text';
    campo.className = 'comentario-edicao';
    campo.maxLength = 350;
    campo.value = pTexto.textContent;

    const btnSalvar = el('button', 'btn-salvar', 'Salvar');
    btnSalvar.type = 'button';
    const btnCancelar = el('button', 'btn-cancelar', 'Cancelar');
    btnCancelar.type = 'button';
    const msg = el('p', 'msg-edicao');

    // Troca o texto por um campo e os botões por Salvar/Cancelar
    pTexto.replaceWith(campo);
    acoes.style.display = 'none';

    const edicao = el('div', 'review-acoes');
    edicao.append(btnSalvar, btnCancelar, msg);
    article.appendChild(edicao);
    campo.focus();

    function cancelar() {
        campo.replaceWith(pTexto);
        edicao.remove();
        acoes.style.display = '';
    }

    btnCancelar.addEventListener('click', cancelar);

    btnSalvar.addEventListener('click', async () => {
        const novoTexto = campo.value.trim();

        if (!novoTexto) {
            msg.textContent = 'O comentário não pode estar vazio.';
            return;
        }

        btnSalvar.disabled = true;

        try {
            const resposta = await fetchAutenticado(`${API_URL}/comentarios/${c._id}`, {
                method: 'PUT',
                body: JSON.stringify({ comentario: novoTexto })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                msg.textContent = dados.message || 'Não foi possível editar.';
                return;
            }

            pTexto.textContent = dados.comentario;
            c.comentario = dados.comentario;
            cancelar();
        } catch (err) {
            msg.textContent = 'Erro de conexão com o servidor.';
        } finally {
            btnSalvar.disabled = false;
        }
    });
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
        area.appendChild(el('p', 'sem-comentarios', 'Seja o primeiro a comentar.'));
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

const campoComentario = document.getElementById('comment-box');
const btnEnviar = document.getElementById('comment-box-submit');
const msgComentario = document.getElementById('comment-box-msg');

async function enviarComentario() {
    msgComentario.textContent = '';

    if (!estaLogado()) {
        window.location.href = 'login.html';
        return;
    }

    const texto = campoComentario.value.trim();

    if (!texto) {
        msgComentario.textContent = 'Digite um comentário antes de enviar.';
        return;
    }

    btnEnviar.disabled = true;
    btnEnviar.textContent = 'Enviando...';

    try {
        const resposta = await fetchAutenticado(
            `${API_URL}/comentarios/${encodeURIComponent(slug)}`,
            {
                method: 'POST',
                body: JSON.stringify({ comentario: texto })
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            msgComentario.textContent = dados.message || 'Não foi possível enviar o comentário.';
            return;
        }

        const area = document.getElementById('comment-box-area');
        const aviso = area.querySelector('.sem-comentarios');
        if (aviso) aviso.remove();

        area.prepend(criarComentario(dados));
        campoComentario.value = '';
    } catch (err) {
        msgComentario.textContent = 'Erro de conexão com o servidor.';
    } finally {
        btnEnviar.disabled = false;
        btnEnviar.textContent = 'Enviar';
    }
}

btnEnviar.addEventListener('click', enviarComentario);

campoComentario.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') enviarComentario();
});