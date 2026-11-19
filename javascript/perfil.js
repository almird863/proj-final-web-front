// perfil.js
// Depende de auth.js (API_URL, estaLogado, getToken, getUsuario, salvarSessao,
// limparSessao, fetchAutenticado) e, opcionalmente, de menu.js (atualizarMenu).
//
// Rotas do backend (todas protegidas com o middleware "autenticar"):
//   GET    /usuarios/me  -> { id, nome, email, foto }
//   PUT    /usuarios/me  -> body { nome } -> { id, nome, email, foto }
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

const fotoPerfil = document.getElementById('perfil-foto');
const tituloPerfil = document.getElementById('perfil-titulo');
const subtituloPerfil = document.getElementById('perfil-subtitulo');

const btnExcluir = document.getElementById('perfil-btn-excluir');

const FOTO_PADRAO = 'assets/person.jpeg';

// Dados do usuário como estão salvos no servidor (usado no "Cancelar")
let dadosAtuais = null;

// ---------- Utilitários ----------

function mostrarMsg(texto, tipo = 'erro') {
    msgPerfil.textContent = texto;
    msgPerfil.className = tipo === 'sucesso' ? 'form-msg sucesso' : 'form-msg';
}

function limparMsg() {
    msgPerfil.textContent = '';
    msgPerfil.className = 'form-msg';
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
    fotoPerfil.src = dados.foto || FOTO_PADRAO;
    fotoPerfil.alt = `Foto de ${dados.nome}`;
}

function preencherCampos(dados) {
    campoNome.value = dados.nome;
    campoEmail.value = dados.email;
}

// Se a foto do Google não carregar, usa a imagem padrão
fotoPerfil.addEventListener('error', () => {
    if (!fotoPerfil.src.endsWith(FOTO_PADRAO)) {
        fotoPerfil.src = FOTO_PADRAO;
    }
});

// Mantém o localStorage e o menu em dia com os dados novos
function sincronizarSessao(dados) {
    salvarSessao(getToken(), {
        id: dados.id,
        nome: dados.nome,
        email: dados.email,
        foto: dados.foto
    });

    if (typeof atualizarMenu === 'function') {
        atualizarMenu();
    }
}

// ---------- Modo de edição ----------
// Só o nome é editável. O e-mail pertence à conta Google e fica sempre bloqueado.

function entrarEdicao() {
    limparMsg();

    campoNome.disabled = false;
    blocoAcoesEdicao.hidden = false;
    btnEditar.hidden = true;

    campoNome.focus();
    campoNome.select();
}

function sairEdicao() {
    campoNome.disabled = true;
    blocoAcoesEdicao.hidden = true;
    btnEditar.hidden = false;
}

function cancelarEdicao() {
    if (dadosAtuais) preencherCampos(dadosAtuais);
    limparMsg();
    sairEdicao();
}

// ---------- Carregar perfil ----------

async function carregarPerfil() {
    try {
        const resposta = await fetchAutenticado(`${API_URL}/usuarios/me`);

        if (!resposta.ok) {
            const erro = await lerJson(resposta);
            mostrarMsg(erro.message || 'Não foi possível carregar seus dados.');
            return;
        }

        dadosAtuais = await resposta.json();
        preencherResumo(dadosAtuais);
        preencherCampos(dadosAtuais);
        sincronizarSessao(dadosAtuais);
    } catch (err) {
        mostrarMsg('Erro de conexão com o servidor.');
    }
}

// ---------- Salvar nome ----------

async function salvarPerfil(e) {
    e.preventDefault();
    limparMsg();

    const nome = campoNome.value.trim();

    if (!nome) {
        mostrarMsg('Informe o seu nome.');
        campoNome.focus();
        return;
    }

    // Nada mudou: só fecha o modo de edição
    if (dadosAtuais && nome === dadosAtuais.nome) {
        sairEdicao();
        return;
    }

    btnSalvar.disabled = true;
    btnSalvar.textContent = 'Salvando...';

    try {
        const resposta = await fetchAutenticado(`${API_URL}/usuarios/me`, {
            method: 'PUT',
            body: JSON.stringify({ nome })
        });

        const dados = await lerJson(resposta);

        if (!resposta.ok) {
            mostrarMsg(dados.message || 'Não foi possível salvar as alterações.');
            return;
        }

        dadosAtuais = dados;
        preencherResumo(dados);
        preencherCampos(dados);
        sincronizarSessao(dados);
        sairEdicao();
        mostrarMsg('Nome atualizado com sucesso.', 'sucesso');
    } catch (err) {
        mostrarMsg('Erro de conexão com o servidor.');
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.textContent = 'Salvar alterações';
    }
}

// ---------- Excluir conta ----------

async function excluirConta() {
    const confirmou = confirm(
        'Tem certeza que deseja excluir sua conta?\n\nSeus comentários também serão apagados. Essa ação é permanente e não pode ser desfeita.'
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