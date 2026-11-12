function atualizarMenu() {
    const itemLogin = document.getElementById('menu-login');
    const itemCadastro = document.getElementById('menu-cadastro');

    if (!itemLogin || !itemCadastro || !estaLogado()) return;

    const usuario = getUsuario();

    // O item de login vira o nome do usuário
    itemLogin.textContent = '';
    const nome = document.createElement('span');
    nome.textContent = usuario.nome;
    itemLogin.appendChild(nome);

    // O item de cadastro vira "SAIR"
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