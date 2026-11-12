const form = document.getElementById('form-login');
const campoEmail = document.getElementById('form-login-nome');
const campoSenha = document.getElementById('form-login-senha');
const msg = document.getElementById('form-login-msg');
const btn = document.getElementById('form-login-btn');

if (estaLogado()) {
    window.location.href = 'index.html';
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = campoEmail.value.trim();
    const senha = campoSenha.value;

    msg.textContent = '';
    btn.disabled = true;
    btn.value = 'ENTRANDO...';

    try {
        const resposta = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            msg.textContent = dados.message || 'Não foi possível entrar';
            return;
        }

        salvarSessao(dados.token, dados.usuario);
        window.location.href = 'index.html';
    } catch (err) {
        msg.textContent = 'Erro de conexão com o servidor';
    } finally {
        btn.disabled = false;
        btn.value = 'ENTRAR';
    }
});