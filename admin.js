// ==========================================
// CONFIGURAÇÃO
// ==========================================
// COLE ABAIXO A MESMA URL DO APPSCRIPT QUE ESTÁ NO SCRIPT.JS
const API_URL = "https://script.google.com/macros/s/AKfycbyVI4pXYIM6GSEAl-TuqKdNPjaNIW7TEWM-rq9UdVh343htO3rb2GL8mVD1PDlaCcz77Q/exec"; 


// ==========================================
// FUNÇÃO 1: CADASTRAR PACIENTE
// ==========================================
async function cadastrarPaciente() {
    const nomeInput = document.getElementById('cadNome');
    const cpfInput = document.getElementById('cadCpf');
    const resultBox = document.getElementById('resultadoCadastro');

    // Validação Simples
    if(!nomeInput.value || !cpfInput.value) {
        Swal.fire('Erro', 'Por favor, preencha o Nome e o CPF.', 'error');
        return;
    }

    // Mostra carregamento
    Swal.showLoading();

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ 
                action: 'cadastrarPaciente', 
                nome: nomeInput.value, 
                cpf: cpfInput.value 
            })
        });

        const res = await response.json();
        Swal.close();

        if(res.success) {
            // Exibe a caixa verde com os dados
            resultBox.style.display = 'block';
            document.getElementById('resUser').innerText = cpfInput.value;
            document.getElementById('resSenha').innerText = res.senha;
            document.getElementById('resId').innerText = res.id;
            
            // Facilitação: Joga o ID direto para o campo de exame
            document.getElementById('exameIdPaciente').value = res.id;
            
            // Feedback sonoro ou visual extra (opcional)
            Swal.fire({
                icon: 'success',
                title: 'Cadastrado!',
                text: 'Entregue a senha ao paciente.',
                timer: 2000,
                showConfirmButton: false
            });

            // Limpa os campos de cadastro para evitar duplicidade
            nomeInput.value = '';
            cpfInput.value = '';

        } else {
            Swal.fire('Erro no Cadastro', res.message, 'error');
        }

    } catch (error) {
        console.error(error);
        Swal.fire('Erro de Conexão', 'Não foi possível conectar ao servidor.', 'error');
    }
}


// ==========================================
// FUNÇÃO 2: LANÇAR EXAME
// ==========================================
async function lancarExame() {
    const idInput = document.getElementById('exameIdPaciente');
    const exameInput = document.getElementById('exameNome');

    if(!idInput.value) {
        Swal.fire('Atenção', 'Informe o ID do paciente (Número do sistema).', 'warning');
        return;
    }

    Swal.showLoading();

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ 
                action: 'salvarExame', 
                idPaciente: idInput.value, 
                nomeExame: exameInput.value 
            })
        });
        
        Swal.close();
        
        // Como o backend não retorna erro específico se o ID não existir (apenas salva),
        // assumimos sucesso se a conexão funcionou.
        Swal.fire('Sucesso', 'Exame lançado na fila de processamento!', 'success');
        
        // Limpa o campo de exame para lançar outro se necessário
        // idInput.value = ''; // (Opcional: manter o ID caso queira lançar vários exames pro mesmo paciente)

    } catch (error) {
        console.error(error);
        Swal.fire('Erro', 'Falha ao lançar exame.', 'error');
    }
}


// ==========================================
// FUNÇÃO 3: UTILITÁRIOS
// ==========================================
function copiarDados() {
    const id = document.getElementById('resId').innerText;
    navigator.clipboard.writeText(id).then(() => {
        const btn = document.querySelector('.btn-outline-success');
        const originalText = btn.innerText;
        
        btn.innerText = 'Copiado!';
        btn.classList.add('active');
        
        setTimeout(() => {
            btn.innerText = originalText;
            btn.classList.remove('active');
        }, 2000);
    });
}