// menu.js
// Depende de auth.js (estaLogado, getUsuario, logout).
// Com sessão: o item LOGIN vira o nome do usuário (link para o perfil)
// e o item CADASTRAR vira SAIR.

function atualizarMenu() {
    const itemLogin = document.getElementById('menu-login');
    const itemCadastro = document.getElementById('menu-cadastro');

    if (!itemLogin || !itemCadastro || !estaLogado()) return;

    const usuario = getUsuario();

    // Nome do usuário -> perfil.html
    itemLogin.textContent = '';
    const linkPerfil = document.createElement('a');
    linkPerfil.href = 'perfil.html';
    linkPerfil.className = 'menu-usuario';
    linkPerfil.title = 'Meu perfil';
    linkPerfil.textContent = usuario.nome;
    itemLogin.appendChild(linkPerfil);

    // SAIR
    itemCadastro.textContent = '';
    const sair = document.createElement('a');
    sair.href = '#';
    sair.textContent = 'SAIR';
    sair.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
    itemCadastro.appendChild(sair);
}

atualizarMenu();