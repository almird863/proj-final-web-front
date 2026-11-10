const API_URL = 'http://localhost:3001';

const lista = document.getElementById('lista-trucks');
const msgStatus = document.getElementById('pesq-msg');
const campo = document.getElementById('pesq-valor');

function criarCard(p) {
    const li = document.createElement('li');
    li.className = 'destaque-card';

    const link = document.createElement('a');
    link.href = `truck_page.html?pagina=${encodeURIComponent(p.slug)}`;

    const divImg = document.createElement('div');
    const img = document.createElement('img');
    img.src = p.imagem;
    img.alt = p.titulo;
    img.className = 'destaque-card-img';
    divImg.appendChild(img);

    const divTexto = document.createElement('div');

    const h3 = document.createElement('h3');
    h3.textContent = p.titulo;

    const desc = document.createElement('p');
    desc.textContent = p.descricao;

    const ul = document.createElement('ul');
    [p.horario, p.local].forEach((texto) => {
        const item = document.createElement('li');
        item.textContent = texto;
        ul.appendChild(item);
    });

    divTexto.append(h3, desc, ul);
    link.append(divImg, divTexto);
    li.appendChild(link);
    return li;
}

async function buscar(termo = '') {
    msgStatus.textContent = 'Carregando...';
    lista.textContent = '';

    try {
        const url = `${API_URL}/paginas?q=${encodeURIComponent(termo)}`;
        const resposta = await fetch(url);
        if (!resposta.ok) throw new Error('Falha na busca');

        const paginas = await resposta.json();

        if (paginas.length === 0) {
            msgStatus.textContent = 'Nenhum food truck encontrado.';
            return;
        }

        msgStatus.textContent = '';
        paginas.forEach((p) => lista.appendChild(criarCard(p)));
    } catch (err) {
        msgStatus.textContent = 'Não foi possível carregar os food trucks.';
    }
}

let temporizador;
campo.addEventListener('input', () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => buscar(campo.value.trim()), 300);
});

buscar();