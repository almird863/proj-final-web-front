// menu.js
// Depende de auth.js (estaLogado, getUsuario, logout).
// Com sessão: o item LOGIN vira o nome do usuário (link para o perfil)
// e um item SAIR é adicionado logo depois.
// Não depende mais do item de cadastro (se ele ainda existir no HTML, é removido).

function atualizarMenu() {
    const itemLogin = document.getElementById('menu-login');

    if (!itemLogin || !estaLogado()) return;

    const usuario = getUsuario();

    // Cadastro não existe mais: a conta é criada no primeiro login com Google
    const itemCadastro = document.getElementById('menu-cadastro');
    if (itemCadastro) itemCadastro.remove();

    // Nome do usuário -> perfil.html
    itemLogin.textContent = '';
    const linkPerfil = document.createElement('a');
    linkPerfil.href = 'perfil.html';
    linkPerfil.className = 'menu-usuario';
    linkPerfil.title = 'Meu perfil';
    linkPerfil.textContent = usuario.nome;
    itemLogin.appendChild(linkPerfil);

    // SAIR: criado uma única vez (esta função pode rodar mais de uma vez)
    if (!document.getElementById('menu-sair')) {
        const itemSair = document.createElement('li');
        itemSair.id = 'menu-sair';

        const sair = document.createElement('a');
        sair.href = '#';
        sair.textContent = 'SAIR';
        sair.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });

        itemSair.appendChild(sair);
        itemLogin.after(itemSair);
    }
}

atualizarMenu();