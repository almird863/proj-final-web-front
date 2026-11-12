// perfil.js
// Depende de auth.js (API_URL, estaLogado, getToken, getUsuario, salvarSessao,
// limparSessao, fetchAutenticado) e, opcionalmente, de menu.js (atualizarMenu).
//
// Rotas esperadas no backend (todas protegidas com o middleware "autenticar"):
//   GET    /usuarios/me         -> { id, nome, email }
//   PUT    /usuarios/me         -> body { nome, email } -> { id, nome, email }
//   PUT    /usuarios/me/senha   -> body { senhaAtual, senhaNova }
//   DELETE /usuarios/me

// ---------- Elementos ----------

const formPerfil = document.getElementById('form-perfil');
const campoNome = document.getElementById('perfil-nome');
const campoEmail = document.getElementById('perfil-email');
const msgPerfil = document.getElementById('perfil-msg');

const btnEditar = document.getElementById('perfil-btn-editar');
const btnSalvar = document.getElementById('perfil-btn-salvar');
const btnCancelar = document.getElementById('perfil-btn-cancelar');
const blocoAcoesEdicao = document.getElementById('perfil-acoes-edicao');

const tituloPerfil = document.getElementById('perfil-titulo');
const subtituloPerfil = document.getElementById('perfil-subtitulo');

const formSenha = document.getElementById('form-senha');
const campoSenhaAtual = document.getElementById('senha-atual');
const campoSenhaNova = document.getElementById('senha-nova');
const campoSenhaConfirmar = document.getElementById('senha-confirmar');
const msgSenha = document.getElementById('senha-msg');
const btnSenha = document.getElementById('senha-btn-salvar');

const btnExcluir = document.getElementById('perfil-btn-excluir');

// Dados do usuário como estão salvos no servidor (usado no "Cancelar")
let dadosAtuais = null;

const TAMANHO_MIN_SENHA = 8;
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------- Utilitários ----------

function mostrarMsg(elemento, texto, tipo = 'erro') {
    elemento.textContent = texto;
    elemento.className = tipo === 'sucesso' ? 'form-msg sucesso' : 'form-msg';
}

function limparMsg(elemento) {
    elemento.textContent = '';
    elemento.className = 'form-msg';
}

// Lê o JSON da resposta sem quebrar se o corpo vier vazio ou inválido
async function lerJson(resposta) {
    try {
        return await resposta.json();
    } catch (err) {
        return {};
    }
}

function preencherResumo(dados) {
    tituloPerfil.textContent = dados.nome;
    subtituloPerfil.textContent = dados.email;
}

function preencherCampos(dados) {
    campoNome.value = dados.nome;
    campoEmail.value = dados.email;
}

// Mantém o localStorage e o menu em dia com os dados novos
function sincronizarSessao(dados) {
    salvarSessao(getToken(), { id: dados.id, nome: dados.nome, email: dados.email });

    if (typeof atualizarMenu === 'function') {
        atualizarMenu();
    }
}

// ---------- Modo de edição ----------

function entrarEdicao() {
    limparMsg(msgPerfil);

    campoNome.disabled = false;
    campoEmail.disabled = false;
    blocoAcoesEdicao.hidden = false;
    btnEditar.hidden = true;

    campoNome.focus();
    campoNome.select();
}

function sairEdicao() {
    campoNome.disabled = true;
    campoEmail.disabled = true;
    blocoAcoesEdicao.hidden = true;
    btnEditar.hidden = false;
}

function cancelarEdicao() {
    if (dadosAtuais) preencherCampos(dadosAtuais);
    limparMsg(msgPerfil);
    sairEdicao();
}

// ---------- Carregar perfil ----------

async function carregarPerfil() {
    try {
        const resposta = await fetchAutenticado(`${API_URL}/usuarios/me`);

        if (!resposta.ok) {
            const erro = await lerJson(resposta);
            mostrarMsg(msgPerfil, erro.message || 'Não foi possível carregar seus dados.');
            return;
        }

        dadosAtuais = await resposta.json();
        preencherResumo(dadosAtuais);
        preencherCampos(dadosAtuais);
        sincronizarSessao(dadosAtuais);
    } catch (err) {
        mostrarMsg(msgPerfil, 'Erro de conexão com o servidor.');
    }
}

// ---------- Salvar dados pessoais ----------

async function salvarPerfil(e) {
    e.preventDefault();
    limparMsg(msgPerfil);

    const nome = campoNome.value.trim();
    const email = campoEmail.value.trim().toLowerCase();

    if (!nome) {
        mostrarMsg(msgPerfil, 'Informe o seu nome.');
        campoNome.focus();
        return;
    }

    if (!REGEX_EMAIL.test(email)) {
        mostrarMsg(msgPerfil, 'Informe um e-mail válido.');
        campoEmail.focus();
        return;
    }

    // Nada mudou: só fecha o modo de edição
    if (dadosAtuais && nome === dadosAtuais.nome && email === dadosAtuais.email) {
        sairEdicao();
        return;
    }

    btnSalvar.disabled = true;
    btnSalvar.textContent = 'Salvando...';

    try {
        const resposta = await fetchAutenticado(`${API_URL}/usuarios/me`, {
            method: 'PUT',
            body: JSON.stringify({ nome, email })
        });

        const dados = await lerJson(resposta);

        if (!resposta.ok) {
            mostrarMsg(msgPerfil, dados.message || 'Não foi possível salvar as alterações.');
            return;
        }

        dadosAtuais = dados;
        preencherResumo(dados);
        preencherCampos(dados);
        sincronizarSessao(dados);
        sairEdicao();
        mostrarMsg(msgPerfil, 'Dados atualizados com sucesso.', 'sucesso');
    } catch (err) {
        mostrarMsg(msgPerfil, 'Erro de conexão com o servidor.');
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.textContent = 'Salvar alterações';
    }
}

// ---------- Alterar senha ----------

async function alterarSenha(e) {
    e.preventDefault();
    limparMsg(msgSenha);

    const senhaAtual = campoSenhaAtual.value;
    const senhaNova = campoSenhaNova.value;
    const senhaConfirmar = campoSenhaConfirmar.value;

    if (!senhaAtual || !senhaNova || !senhaConfirmar) {
        mostrarMsg(msgSenha, 'Preencha todos os campos.');
        return;
    }

    if (senhaNova.length < TAMANHO_MIN_SENHA) {
        mostrarMsg(msgSenha, `A nova senha deve ter pelo menos ${TAMANHO_MIN_SENHA} caracteres.`);
        campoSenhaNova.focus();
        return;
    }

    if (senhaNova !== senhaConfirmar) {
        mostrarMsg(msgSenha, 'A confirmação não é igual à nova senha.');
        campoSenhaConfirmar.focus();
        return;
    }

    if (senhaNova === senhaAtual) {
        mostrarMsg(msgSenha, 'A nova senha deve ser diferente da atual.');
        campoSenhaNova.focus();
        return;
    }

    btnSenha.disabled = true;
    btnSenha.textContent = 'Atualizando...';

    try {
        const resposta = await fetchAutenticado(`${API_URL}/usuarios/me/senha`, {
            method: 'PUT',
            body: JSON.stringify({ senhaAtual, senhaNova })
        });

        const dados = await lerJson(resposta);

        if (!resposta.ok) {
            mostrarMsg(msgSenha, dados.message || 'Não foi possível atualizar a senha.');
            return;
        }

        formSenha.reset();
        mostrarMsg(msgSenha, 'Senha atualizada com sucesso.', 'sucesso');
    } catch (err) {
        mostrarMsg(msgSenha, 'Erro de conexão com o servidor.');
    } finally {
        btnSenha.disabled = false;
        btnSenha.textContent = 'Atualizar senha';
    }
}

// ---------- Excluir conta ----------

async function excluirConta() {
    const confirmou = confirm(
        'Tem certeza que deseja excluir sua conta?\n\nEssa ação é permanente e não pode ser desfeita.'
    );
    if (!confirmou) return;

    btnExcluir.disabled = true;
    btnExcluir.textContent = 'Excluindo...';

    try {
        const resposta = await fetchAutenticado(`${API_URL}/usuarios/me`, {
            method: 'DELETE'
        });

        if (!resposta.ok) {
            const dados = await lerJson(resposta);
            alert(dados.message || 'Não foi possível excluir a conta.');
            return;
        }

        limparSessao();
        window.location.href = 'index.html';
    } catch (err) {
        alert('Erro de conexão com o servidor.');
    } finally {
        btnExcluir.disabled = false;
        btnExcluir.textContent = 'Excluir minha conta';
    }
}

// ---------- Inicialização ----------

function iniciar() {
    // Mostra algo imediatamente com o que já está no localStorage
    const usuarioLocal = getUsuario();
    if (usuarioLocal) {
        dadosAtuais = usuarioLocal;
        preencherResumo(usuarioLocal);
        preencherCampos(usuarioLocal);
    }

    btnEditar.addEventListener('click', entrarEdicao);
    btnCancelar.addEventListener('click', cancelarEdicao);
    formPerfil.addEventListener('submit', salvarPerfil);
    formSenha.addEventListener('submit', alterarSenha);
    btnExcluir.addEventListener('click', excluirConta);

    // Esc cancela a edição
    formPerfil.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !blocoAcoesEdicao.hidden) cancelarEdicao();
    });

    // Atualiza com os dados reais do servidor
    carregarPerfil();
}

if (!estaLogado()) {
    window.location.href = 'login.html';
} else {
    iniciar();
}