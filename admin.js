// ==========================================
// ARQUIVO: admin.js (VERSÃO CORRIGIDA - FIM DO LOOP)
// ==========================================

const API_URL = "https://script.google.com/macros/s/AKfycbyVI4pXYIM6GSEAl-TuqKdNPjaNIW7TEWM-rq9UdVh343htO3rb2GL8mVD1PDlaCcz77Q/exec";
const BRAND_COLOR = '#21409a'; 

// --- FUNÇÃO 1: BUSCAR PACIENTE ---
async function buscarPaciente() {
    const termo = document.getElementById('buscaTermo').value;
    const btn = document.querySelector('button[onclick="buscarPaciente()"]');

    if (!termo) {
        Swal.fire({ title: 'Atenção', text: 'Digite o Nome ou CPF para buscar.', icon: 'warning', confirmButtonColor: BRAND_COLOR });
        return;
    }

    const textoOriginal = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'query_ref', 
                term_ref: termo     
            })
        });

        const res = await response.json();
        btn.innerHTML = textoOriginal;
        btn.disabled = false;

        if (res.success) {
            document.getElementById('buscNome').innerText = res.name_res;
            document.getElementById('buscCpf').innerText = res.id_res;
            document.getElementById('buscId').innerText = res.internal_id;
            document.getElementById('resultadoBusca').style.display = 'block';
        } else {
            Swal.fire({ title: 'Não encontrado', text: 'Registro não localizado.', icon: 'info', confirmButtonColor: BRAND_COLOR });
            document.getElementById('resultadoBusca').style.display = 'none';
        }
    } catch (error) {
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
        console.error(error);
        Swal.fire({ title: 'Erro', text: 'Falha de conexão ou erro no servidor.', icon: 'error', confirmButtonColor: BRAND_COLOR });
    }
}

// --- FUNÇÃO 2: CADASTRAR PACIENTE (CORRIGIDA) ---
async function cadastrarPaciente() {
    const nome = document.getElementById('cadNome').value;
    const cpf = document.getElementById('cadCpf').value;
    const btn = document.getElementById('btnCadastrar');

    if (!nome || !cpf) {
        Swal.fire({ title: 'Atenção', text: 'Preencha todos os campos!', icon: 'warning', confirmButtonColor: BRAND_COLOR });
        return;
    }

    if (btn) btn.disabled = true;
    
    // Inicia o Loading na tela
    Swal.fire({ 
        title: 'Processando...', 
        text: 'Salvando no banco de dados.', 
        allowOutsideClick: false, 
        showConfirmButton: false, 
        didOpen: () => { Swal.showLoading(); } 
    });

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'add_entry', 
                entry_name: nome,    
                entry_id: cpf        
            })
        });

        const res = await response.json();
        if (btn) btn.disabled = false;

        if (res.success) {
            // SUCESSO: Mostra os dados e o alerta verde
            document.getElementById('resUser').innerText = res.id_display;
            document.getElementById('resSenha').innerText = res.key_gen;
            document.getElementById('resId').innerText = res.internal_id;
            
            document.getElementById('resultadoCadastro').style.display = 'block';
            
            // Joga o ID direto para a aba de exames para facilitar
            document.getElementById('exameIdPaciente').value = res.internal_id;
            
            // Limpa os campos
            document.getElementById('cadNome').value = '';
            document.getElementById('cadCpf').value = '';

            Swal.fire({ 
                icon: 'success', 
                title: 'Cadastrado!', 
                text: 'Paciente salvo com sucesso.', 
                timer: 2000, 
                confirmButtonColor: BRAND_COLOR 
            });
            
        } else {
            // ERRO (JÁ EXISTE OU OUTRO): FECHA O LOADING E AVISA
            // AQUI ESTAVA FALTANDO O CÓDIGO ANTES!
            let mensagemErro = res.message || 'Não foi possível cadastrar.';
            
            if(mensagemErro === "Já existe") {
                mensagemErro = "Este CPF já possui cadastro no sistema.";
            }

            Swal.fire({ 
                title: 'Atenção', 
                text: mensagemErro, 
                icon: 'warning', 
                confirmButtonColor: BRAND_COLOR 
            });
        }

    } catch (error) {
        if (btn) btn.disabled = false;
        console.error(error);
        Swal.fire({ title: 'Erro', text: 'Erro de conexão. Verifique a internet.', icon: 'error', confirmButtonColor: BRAND_COLOR });
    }
}

// --- FUNÇÃO 3: AUXILIARES ---
function usarIdEncontrado() {
    const idEncontrado = document.getElementById('buscId').innerText;
    if (idEncontrado && idEncontrado !== "...") {
        document.getElementById('exameIdPaciente').value = idEncontrado;
        // Rola a tela suavemente até a área de exames (opcional)
        document.getElementById('exameNome').focus();
    }
}

async function lancarExame() {
    const idPaciente = document.getElementById('exameIdPaciente').value;
    const nomeExame = document.getElementById('exameNome').value;
    const btn = document.querySelector('button[onclick="lancarExame()"]');

    if (!idPaciente || idPaciente == "0") {
        Swal.fire({ title: 'Atenção', text: 'Selecione um paciente primeiro (Cadastre ou Busque).', icon: 'warning', confirmButtonColor: BRAND_COLOR });
        return;
    }

    const textoOriginal = btn.innerHTML;
    btn.innerHTML = 'Enviando...';
    btn.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'save_data', 
                id_ref: idPaciente,
                item_ref: nomeExame
            })
        });

        const res = await response.json();
        btn.innerHTML = textoOriginal;
        btn.disabled = false;

        if (res.success) {
            Swal.fire({ title: 'Sucesso', text: 'Exame lançado na ficha!', icon: 'success', confirmButtonColor: BRAND_COLOR });
        } else {
            Swal.fire({ title: 'Erro', text: res.message || 'Erro ao lançar.', icon: 'error', confirmButtonColor: BRAND_COLOR });
        }
    } catch (error) {
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
        Swal.fire({ title: 'Erro', text: 'Falha de conexão.', icon: 'error', confirmButtonColor: BRAND_COLOR });
    }
}
