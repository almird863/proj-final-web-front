const formCadastro = document.getElementById('form-cadastro')

formCadastro.addEventListener('submit', (event) => {
    event.preventDefault()

    const nome = document.getElementById('form-cadastro-nome').value
    const email = document.getElementById('form-cadastro-email').value
    const senha = document.getElementById('form-cadastro-senha').value

    const newObj = {
        nome: nome,
        email: email,
        senha: senha
    }

    fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: {
            'content-type':'application/json'
        },
        body:JSON.stringify(newObj)
    })
        .then((res) => {
            if (res.ok) {
                return res.json()
            } else {
                return res.json().then(erro => {
                    throw new Error(erro.message)
                })
            }
        })
        .then((dados) => {
            alert('Cadastro realizado com sucesso!');
            formCadastro.reset()
            window.location.href = "login.html";
        })
        .catch((erro) => {
            alert(erro.message);
        })
})
