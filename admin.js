/**
 * CONFIGURAÇÃO DO ADMIN
 */
const API_URL = "https://script.google.com/macros/s/AKfycbyVI4pXYIM6GSEAl-TuqKdNPjaNIW7TEWM-rq9UdVh343htO3rb2GL8mVD1PDlaCcz77Q/exec"; 

// ==========================================
// 1. CADASTRAR PACIENTE
// ==========================================
async function cadastrarPaciente() {
    const nome = document.getElementById('cadNome').value;
    const cpf = document.getElementById('cadCpf').value;
    const boxResultado = document.getElementById('resultadoCadastro');

    if (!nome || !cpf) return Swal.fire('Atenção', 'Preencha Nome e CPF', 'warning');

    Swal.fire({ title: 'Cadastrando...', didOpen: () => Swal.showLoading() });

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'cadastrarPaciente', nome: nome, cpf: cpf })
        });

        const res = await response.json();
        Swal.close();

        if (res.success) {
            Swal.fire({
                icon: 'success',
                title: 'Cadastrado!',
                text: 'ID enviado para o Bloco 3.',
                timer: 1500,
                showConfirmButton: false
            });
            
            // Mostra no Bloco 1
            boxResultado.style.display = 'block';
            document.getElementById('resUser').innerText = cpf;
            document.getElementById('resSenha').innerText = res.senha;
            document.getElementById('resId').innerText = res.id;
            
            // === JOGA O ID PARA O BLOCO 3 ===
            const inputBloco3 = document.getElementById('exameIdPaciente');
            if(inputBloco3) {
                inputBloco3.value = res.id;
                // Animação visual (Pisca Verde)
                inputBloco3.style.backgroundColor = "#198754"; 
                inputBloco3.style.color = "#fff";
                inputBloco3.style.transition = "0.5s";
                setTimeout(() => { 
                    inputBloco3.style.backgroundColor = "#e8f5e9"; 
                    inputBloco3.style.color = "#000"; 
                }, 1000);
            }

            // Limpa Bloco 1
            document.getElementById('cadNome').value = '';
            document.getElementById('cadCpf').value = '';
        } else {
            Swal.fire('Erro', res.message, 'error');
        }
    } catch (error) {
        console.error(error);
        Swal.fire('Erro', 'Falha na conexão.', 'error');
    }
}

// ==========================================
// 2. BUSCAR PACIENTE
// ==========================================
async function buscarPaciente() {
    const termo = document.getElementById('buscaTermo').value;
    const box = document.getElementById('resultadoBusca');

    if (!termo) return Swal.fire('Atenção', 'Digite algo para buscar', 'warning');

    const btnBusca = document.querySelector('.input-group button');
    const iconeOriginal = btnBusca.innerHTML;
    btnBusca.innerHTML = '<div class="spinner-border spinner-border-sm"></div>';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'buscarPaciente', termo: termo })
        });

        const res = await response.json();
        btnBusca.innerHTML = iconeOriginal;

        if (res.success) {
            box.style.display = 'block';
            document.getElementById('buscNome').innerText = res.nome;
            document.getElementById('buscCpf').innerText = res.cpf;
            document.getElementById('buscId').innerText = res.id;
        } else {
            box.style.display = 'none';
            Swal.fire('Não encontrado', 'Verifique o nome ou CPF.', 'info');
        }
    } catch (error) {
        console.error(error);
        btnBusca.innerHTML = iconeOriginal;
        Swal.fire('Erro', 'Falha na conexão.', 'error');
    }
}

// Função Auxiliar: Usar ID da Busca
function usarIdEncontrado() {
    const idEncontrado = document.getElementById('buscId').innerText;
    if(!idEncontrado || idEncontrado === '...') return;

    const inputBloco3 = document.getElementById('exameIdPaciente');
    inputBloco3.value = idEncontrado;
    
    // Animação
    inputBloco3.style.backgroundColor = "#198754";
    inputBloco3.style.color = "#fff";
    inputBloco3.style.transition = "0.5s";
    setTimeout(() => { 
        inputBloco3.style.backgroundColor = "#e8f5e9"; 
        inputBloco3.style.color = "#000"; 
    }, 1000);
}

// ==========================================
// 3. LANÇAR EXAME
// ==========================================
async function lancarExame() {
    const id = document.getElementById('exameIdPaciente').value;
    const exame = document.getElementById('exameNome').value;

    if (!id) return Swal.fire('Atenção', 'ID vazio. Cadastre ou Busque o paciente.', 'warning');

    Swal.fire({ title: 'Salvando...', didOpen: () => Swal.showLoading() });

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'salvarExame', idPaciente: id, nomeExame: exame })
        });

        const res = await response.json();
        Swal.close();

        if (res.success) {
            Swal.fire('Sucesso', 'Exame lançado!', 'success');
        } else {
            Swal.fire('Erro', res.message, 'error');
        }
    } catch (error) {
        console.error(error);
        Swal.fire('Erro', 'Falha na conexão.', 'error');
    }
}
