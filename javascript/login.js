const formLogin = document.getElementById("form-login");
const API_URL = 'http://localhost:3001'

formLogin.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("form-login-nome").value;
    const senha = document.getElementById("form-login-senha").value;

    const loginReq = {
        email: email,
        senha: senha
    }

    const resposta = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginReq)
    });

    const dados = await resposta.json();

    if (resposta.ok) {
        window.location.replace("index.html");
    } else {
        alert(dados.erro);
    }
});