// login.js
// Depende de auth.js (API_URL, estaLogado, salvarSessao).
// A biblioteca do Google (gsi/client) é carregada DEPOIS deste arquivo, no HTML.

// O ID do cliente OAuth NÃO é segredo (aparece no front de qualquer site).
// Use o mesmo valor do GOOGLE_CLIENT_ID do backend.
const GOOGLE_CLIENT_ID = '486979187580-2j3uqgbaaf2er0ute6ukfsp2d4clqrq2.apps.googleusercontent.com';

const areaBotao = document.getElementById('google-btn');
const msg = document.getElementById('form-login-msg');

let bibliotecaCarregada = false;

// Quem já está logado não precisa ver a tela de login
if (estaLogado()) {
    window.location.href = 'index.html';
}

function mostrarErro(texto) {
    msg.textContent = texto;
}

// ---------- Resposta do Google ----------

// O Google chama esta função com { credential } depois que a pessoa escolhe a conta
async function aoReceberCredencial(resposta) {
    mostrarErro('');
    areaBotao.style.opacity = '0.5';
    areaBotao.style.pointerEvents = 'none';
    msg.textContent = 'Entrando...';

    try {
        const res = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: resposta.credential })
        });

        let dados = {};
        try {
            dados = await res.json();
        } catch (err) {
            // corpo vazio ou inválido: segue com mensagem padrão
        }

        if (!res.ok) {
            mostrarErro(dados.message || 'Não foi possível entrar com o Google.');
            return;
        }

        salvarSessao(dados.token, dados.usuario);
        window.location.href = 'index.html';
    } catch (err) {
        mostrarErro('Erro de conexão com o servidor.');
    } finally {
        areaBotao.style.opacity = '';
        areaBotao.style.pointerEvents = '';

        if (msg.textContent === 'Entrando...') {
            msg.textContent = '';
        }
    }
}

// ---------- Inicialização do botão ----------

function iniciarGoogle() {
    if (bibliotecaCarregada) return;
    bibliotecaCarregada = true;

    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: aoReceberCredencial,
        // Não escolhe a conta sozinho: a pessoa sempre clica no botão
        auto_select: false
    });

    // O botão aceita largura entre 200 e 400px
    const largura = Math.min(Math.max(areaBotao.offsetWidth, 200), 400);

    google.accounts.id.renderButton(areaBotao, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        logo_alignment: 'left',
        locale: 'pt-BR',
        width: largura
    });
}

// A biblioteca chama este gancho quando termina de carregar
window.onGoogleLibraryLoad = iniciarGoogle;

// Caso a biblioteca já tenha carregado antes deste arquivo
if (window.google && window.google.accounts && window.google.accounts.id) {
    iniciarGoogle();
}

// Se após alguns segundos o botão não apareceu (bloqueador de anúncios, sem internet...)
setTimeout(() => {
    if (!bibliotecaCarregada) {
        mostrarErro('Não foi possível carregar o login do Google. Desative bloqueadores de anúncio ou tente novamente.');
    }
}, 6000);