// ==========================================
// ARQUIVO: admin.js (VERSÃO FINAL - FINANCEIRO)
// ==========================================

const API_URL = "https://script.google.com/macros/s/AKfycbyVI4pXYIM6GSEAl-TuqKdNPjaNIW7TEWM-rq9UdVh343htO3rb2GL8mVD1PDlaCcz77Q/exec";
const BRAND_COLOR = '#21409a'; 

// --- FUNÇÃO 1: BUSCAR PACIENTE E SEUS DÉBITOS ---
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
        // 1. Busca os dados do paciente
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

            // 2. BUSCA OS EXAMES DELE PARA O FINANCEIRO (Automático)
            carregarFinanceiro(res.internal_id);

        } else {
            Swal.fire({ title: 'Não encontrado', text: 'Registro não localizado.', icon: 'info', confirmButtonColor: BRAND_COLOR });
            document.getElementById('resultadoBusca').style.display = 'none';
        }
    } catch (error) {
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
        console.error(error);
        Swal.fire({ title: 'Erro', text: 'Falha de conexão.', icon: 'error', confirmButtonColor: BRAND_COLOR });
    }
}

// --- FUNÇÃO NOVA: CARREGAR EXAMES E FINANCEIRO ---
async function carregarFinanceiro(idPaciente) {
    const divLista = document.getElementById('listaFinanceira');
    divLista.innerHTML = '<div class="text-center text-muted"><i class="fas fa-spinner fa-spin"></i> Verificando débitos...</div>';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'buscarExames',
                idPaciente: idPaciente
            })
        });

        const exames = await response.json();

        if (exames.length === 0) {
            divLista.innerHTML = '<div class="text-muted text-center">Nenhum exame lançado.</div>';
            return;
        }

        let html = '<ul class="list-group list-group-flush">';
        
        exames.forEach(ex => {
            let statusPagamento = ex.pagamento.toLowerCase(); // 'pendente' ou 'pago'
            let botaoAcao = '';

            // SE ESTIVER PENDENTE, MOSTRA BOTÃO DE CONFIRMAR
            if (statusPagamento === 'pendente') {
                botaoAcao = `
                    <button class="btn btn-sm btn-success float-end" 
                        onclick="confirmarPagamento('${idPaciente}', '${ex.nome}')" 
                        title="Confirmar Pagamento">
                        <i class="fas fa-dollar-sign"></i> Receber
                    </button>
                `;
            } else {
                botaoAcao = `<span class="badge bg-success float-end"><i class="fas fa-check"></i> Pago</span>`;
            }

            html += `
                <li class="list-group-item px-0 py-2 d-flex justify-content-between align-items-center" style="background: transparent;">
                    <div>
                        <span class="fw-bold d-block text-dark" style="font-size: 0.85rem;">${ex.nome}</span>
                        <span class="small text-muted">${ex.status}</span>
                    </div>
                    <div>${botaoAcao}</div>
                </li>
            `;
        });

        html += '</ul>';
        divLista.innerHTML = html;

    } catch (error) {
        divLista.innerHTML = '<div class="text-danger small">Erro ao carregar exames.</div>';
    }
}

// --- FUNÇÃO NOVA: CONFIRMAR PAGAMENTO ---
async function confirmarPagamento(idPaciente, nomeExame) {
    // Confirmação Visual
    const result = await Swal.fire({
        title: 'Confirmar Recebimento?',
        text: `Deseja marcar "${nomeExame}" como PAGO?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, Recebido!'
    });

    if (!result.isConfirmed) return;

    Swal.showLoading();

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'confirmar_pagamento',
                id_ref: idPaciente,
                nome_exame: nomeExame
            })
        });

        const res = await response.json();
        
        if (res.success) {
            Swal.fire({
                title: 'Confirmado!',
                text: 'Pagamento registrado com sucesso.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
            // Recarrega a lista para atualizar o botão para "Pago"
            carregarFinanceiro(idPaciente);
        } else {
            Swal.fire('Erro', res.message || 'Não foi possível atualizar.', 'error');
        }

    } catch (e) {
        Swal.fire('Erro', 'Falha na conexão.', 'error');
    }
}

// --- FUNÇÕES DE CADASTRO E LANÇAMENTO (IGUAIS ANTERIORMENTE) ---

async function cadastrarPaciente() {
    const nome = document.getElementById('cadNome').value;
    const cpf = document.getElementById('cadCpf').value;
    const btn = document.getElementById('btnCadastrar');

    if (!nome || !cpf) {
        Swal.fire({ title: 'Atenção', text: 'Preencha todos os campos!', icon: 'warning', confirmButtonColor: BRAND_COLOR });
        return;
    }

    if (btn) btn.disabled = true;
    
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
            document.getElementById('resUser').innerText = res.id_display;
            document.getElementById('resSenha').innerText = res.key_gen;
            document.getElementById('resId').innerText = res.internal_id;
            
            document.getElementById('resultadoCadastro').style.display = 'block';
            document.getElementById('exameIdPaciente').value = res.internal_id;
            
            document.getElementById('cadNome').value = '';
            document.getElementById('cadCpf').value = '';

            Swal.fire({ icon: 'success', title: 'Cadastrado!', text: 'ID: ' + res.internal_id, timer: 2000, confirmButtonColor: BRAND_COLOR });
            
        } else {
            let mensagemErro = res.message || 'Não foi possível cadastrar.';
            if(mensagemErro === "Já existe") mensagemErro = "Este CPF já possui cadastro.";
            Swal.fire({ title: 'Atenção', text: mensagemErro, icon: 'warning', confirmButtonColor: BRAND_COLOR });
        }

    } catch (error) {
        if (btn) btn.disabled = false;
        console.error(error);
        Swal.fire({ title: 'Erro', text: 'Erro de conexão.', icon: 'error', confirmButtonColor: BRAND_COLOR });
    }
}

function usarIdEncontrado() {
    const idEncontrado = document.getElementById('buscId').innerText;
    if (idEncontrado && idEncontrado !== "...") {
        document.getElementById('exameIdPaciente').value = idEncontrado;
        document.getElementById('exameNome').focus();
    }
}

async function lancarExame() {
    const idPaciente = document.getElementById('exameIdPaciente').value;
    const nomeExame = document.getElementById('exameNome').value;
    const btn = document.querySelector('button[onclick="lancarExame()"]');

    if (!idPaciente || idPaciente == "0") {
        Swal.fire({ title: 'Atenção', text: 'Selecione um paciente primeiro.', icon: 'warning', confirmButtonColor: BRAND_COLOR });
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
            Swal.fire({ title: 'Sucesso', text: 'Exame lançado!', icon: 'success', confirmButtonColor: BRAND_COLOR });
            // Atualiza a lista financeira ali mesmo para aparecer o novo exame pendente
            carregarFinanceiro(idPaciente);
        } else {
            Swal.fire({ title: 'Erro', text: res.message, icon: 'error', confirmButtonColor: BRAND_COLOR });
        }
    } catch (error) {
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
        Swal.fire({ title: 'Erro', text: 'Falha de conexão.', icon: 'error', confirmButtonColor: BRAND_COLOR });
    }
}
