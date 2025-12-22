/**
 * CONFIGURAÇÃO DO ADMIN
 */
const API_URL = "https://script.google.com/macros/s/AKfycbyVI4pXYIM6GSEAl-TuqKdNPjaNIW7TEWM-rq9UdVh343htO3rb2GL8mVD1PDlaCcz77Q/exec"; 

// ==========================================
// 1. CADASTRAR PACIENTE
// ==========================================
function cadastrarPaciente() {
    // Pegamos os valores dos campos
    const nome = document.getElementById('cadNome').value;
    const cpf = document.getElementById('cadCpf').value;
    
    // === MÁGICA VISUAL PARTE 1 (TRAVAR) ===
    const btn = document.getElementById('btnCadastrar'); // Pega o botão pelo ID
    const textoOriginal = btn.innerHTML; // Guarda o texto "Cadastrar" na memória
    
    // Muda o texto para "Salvando..." com um ícone girando
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    // Desabilita o clique (fica cinza)
    btn.disabled = true; 
    // ======================================

    // Validação simples
    if (!nome || !cpf) {
        Swal.fire('Erro', 'Preencha todos os campos!', 'error');
        
        // Se deu erro, temos que destravar o botão senão ele fica travado pra sempre
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
        return;
    }

    // Chama o Google Apps Script
    google.script.run
        .withSuccessHandler(function(res) {
            
            // === MÁGICA VISUAL PARTE 2 (DESTRAVAR) ===
            // O Google respondeu! Vamos voltar o botão ao normal.
            btn.innerHTML = textoOriginal;
            btn.disabled = false;
            // =========================================

            if (res.success) {
                // Preenche os campos do Bloco 3 (Resultado)
                document.getElementById('resUser').innerText = res.id; // Mostra o ID/User
                document.getElementById('resSenha').innerText = res.senha;
                document.getElementById('resId').innerText = res.id;
                document.getElementById('resultadoCadastro').style.display = 'block';
                
                // Preenche automaticamente o campo do Bloco 3 (Lançar Exame)
                document.getElementById('exameIdPaciente').value = res.id;

                // Limpa os campos de cadastro
                document.getElementById('cadNome').value = '';
                document.getElementById('cadCpf').value = '';
                
                Swal.fire('Sucesso', 'Paciente cadastrado!', 'success');
            } else {
                Swal.fire('Erro', res.message, 'error');
            }
        })
        .withFailureHandler(function(erro) {
            // Se der erro de conexão, também temos que destravar
            btn.innerHTML = textoOriginal;
            btn.disabled = false;
            Swal.fire('Erro Fatal', 'Falha na comunicação.', 'error');
        })
        .cadastrarPaciente(nome, cpf);
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

