const pesqValor = document.querySelector('#pesq-valor');
const itens = document.querySelectorAll('.pesq-ul-item');
//
const commentBtn = document.getElementById('comment-box-submit');
//
const API_URL = 'https://proj-final-web-back.onrender.com';

function criarCard(pagina) {
    const card = document.createElement('div');
    card.className = 'destaque-card';

    const link = document.createElement('a');
    link.href = `truck_page.html?pagina=${encodeURIComponent(pagina.slug)}`;

    // Bloco da imagem
    const divImg = document.createElement('div');
    const img = document.createElement('img');
    img.src = pagina.imagem;
    img.alt = pagina.titulo;
    img.className = 'destaque-card-img';
    divImg.appendChild(img);
    divImg.className = 'destaque-card-imagem';

    // Bloco do texto
    const divTexto = document.createElement('div');
    divTexto.className = 'destaque-card-texto';

    const h3 = document.createElement('h3');
    h3.textContent = pagina.titulo;

    const p = document.createElement('p');
    p.textContent = pagina.descricao;

    const ul = document.createElement('ul');
    [pagina.horario, pagina.local].forEach((texto) => {
        const li = document.createElement('li');
        li.textContent = texto;
        ul.appendChild(li);
    });

    divTexto.append(h3, p, ul);
    link.append(divImg, divTexto);
    card.appendChild(link);

    return card;
}

async function carregarDestaques() {
    const container = document.getElementById('lista-destaques');
    container.textContent = 'Carregando...';

    try {
        const resposta = await fetch(`${API_URL}/paginas/destaques`);
        if (!resposta.ok) throw new Error('Falha ao buscar páginas');

        const paginas = await resposta.json();
        container.textContent = '';

        if (paginas.length === 0) {
            container.textContent = 'Nenhuma página cadastrada';
            return;
        }

        paginas.forEach((pagina) => container.appendChild(criarCard(pagina)));
    } catch (err) {
        container.textContent = 'Não foi possível carregar os destaques';
        console.log(err)
    }
}

carregarDestaques();

if (pesqValor != null) {
    pesqValor.addEventListener('input', (evento) => {
        const termo = evento.target.value.toLowerCase();

        itens.forEach(itens => {
            const nomeItem = itens.querySelector('h3');
            const textoItem = nomeItem.textContent.toLowerCase();
            if (textoItem.includes(termo)) {
                itens.style.display = "block";
            }
            else {
                itens.style.display = "none";
            }
        });
    });
}

if (commentBtn != null) {
    commentBtn.addEventListener('click', function (e) {
        e.preventDefault();

        const textComentario = document.getElementById('comment-box').value;
        // const starRating = document.querySelector('.star-rating').value;

        if (textComentario.trim() == '') {
            alert('Por favor, escreva um comentário.');
            return;
        }

        const cardModelo = document.getElementById('review-card');
        const novoCard = cardModelo.cloneNode(true);

        novoCard.removeAttribute('id');
        novoCard.querySelector('.titulo').textContent = "Usuário"

        novoCard.querySelector('.comentario').textContent = `${textComentario}`

        const areaComentarios = document.getElementById('comment-box-area');
        areaComentarios.appendChild(novoCard);

        document.getElementById('comment-box').value = '';
    });
}

const searchBar = document.getElementById('search-bar').value;
const searchBtn = document.getElementById('btn-search');

if (searchBar != null) {
    searchBtn.addEventListener('click', function () {
        window.location.href = 'truck_page.html'
    })
}
else {
    alert("Por favor digite um nome.")
}