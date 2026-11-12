const API_URL = 'https://proj-final-web-back.onrender.com';

function salvarSessao(token, usuario) {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
}

function getToken() {
    return localStorage.getItem('token');
}

function getUsuario() {
    try {
        return JSON.parse(localStorage.getItem('usuario'));
    } catch (err) {
        return null;
    }
}

function estaLogado() {
    return Boolean(getToken() && getUsuario());
}

function limparSessao() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
}

function logout() {
    limparSessao();
    window.location.href = 'index.html';
}

// Cabeçalho pronto para rotas protegidas
function headersAutenticados() {
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
    };
}

// fetch para rotas protegidas: se o token expirou (401), limpa a sessão e manda para o login
async function fetchAutenticado(url, opcoes = {}) {
    const resposta = await fetch(url, {
        ...opcoes,
        headers: { ...headersAutenticados(), ...(opcoes.headers || {}) }
    });

    if (resposta.status === 401) {
        limparSessao();
        window.location.href = 'login.html';
    }

    return resposta;
}