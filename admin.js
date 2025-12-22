// ==========================================
// ARQUIVO: admin.js (CORRIGIDO PARA USO EXTERNO)
// ==========================================

// COLE AQUI A MESMA URL QUE ESTÁ NO SEU SCRIPT.JS
const API_URL = "https://script.google.com/macros/s/AKfycbyVI4pXYIM6GSEAl-TuqKdNPjaNIW7TEWM-rq9UdVh343htO3rb2GL8mVD1PDlaCcz77Q/exec";

// --- 1. FUNÇÃO DE BUSCAR PACIENTE ---
async function buscarPaciente() {
    const termo = document.getElementById('buscaTermo').value;
    const btn = document.querySelector('button[onclick="buscarPaciente()"]');

    if (!termo) {
        Swal.fire('Atenção', 'Digite um CPF ou Nome para buscar.', 'warning');
        return;
    }

    // Feedback visual
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'buscarPaciente',
                termo: termo
            })
        });

        const res = await response.json();

        // Destrava botão
        btn.innerHTML = textoOriginal;
        btn.disabled = false;

        if (res.success) {
            document.getElementById('buscNome').innerText = res.nome;
            document.getElementById('buscCpf').innerText = res.cpf;
            document.getElementById('buscId').innerText = res.id;
            document.getElementById('resultadoBusca').style.display = 'block';
        } else {
            Swal.fire('Não encontrado', res.message || 'Paciente não localizado.', 'info');
            document.getElementById('resultadoBusca').style.display = 'none';
        }

    } catch (error) {
        console.error(error);
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
        Swal.fire('Erro', 'Falha de conexão com o servidor.', 'error');
    }
}

// --- FUNÇÃO AUXILIAR: BOTÃO "USAR ID" ---
function usarIdEncontrado() {
    const idEncontrado = document.getElementById('buscId').innerText;
    if (idEncontrado && idEncontrado !== "...") {
        document.getElementById('exameIdPaciente').value = idEncontrado;
        document.getElementById('exameNome').focus();
        
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });
          
        Toast.fire({
            icon: 'success',
            title: 'ID ' + idEncontrado + ' selecionado!'
        });
    }
}

// --- 2. FUNÇÃO DE CADASTRAR PACIENTE ---
async function cadastrarPaciente() {
    const nome = document.getElementById('cadNome').value;
    const cpf = document.getElementById('cadCpf').value;
    const btn = document.getElementById('btnCadastrar');

    if (!nome || !cpf) {
        Swal.fire('Atenção', 'Preencha todos os campos!', 'warning');
        return;
    }

    // Trava Tela
    if (btn) btn.disabled = true;

    Swal.fire({
        title: 'Salvando...',
        text: 'Aguarde enquanto cadastramos.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => { Swal.showLoading(); }
    });

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'cadastrarPaciente',
                nome: nome,
                cpf: cpf
            })
        });

        const res = await response.json();

        // Destrava botão
        if (btn) btn.disabled = false;

        if (res.success) {
            // Sucesso
            document.getElementById('resUser').innerText = res.cpf || cpf;
            document.getElementById('resSenha').innerText = res.senha;
            document.getElementById('resId').innerText = res.id;
            
            document.getElementById('resultadoCadastro').style.display = 'block';
            document.getElementById('exameIdPaciente').value = res.id;

            // Limpa campos
            document.getElementById('cadNome').value = '';
            document.getElementById('cadCpf').value = '';

            Swal.fire({
                icon: 'success',
                title: 'Cadastrado!',
                text: 'ID Gerado: ' + res.id,
                timer: 3000,
                showConfirmButton: true
            });

        } else {
            Swal.fire('Erro', res.message || 'Erro ao cadastrar.', 'error');
        }

    } catch (error) {
        console.error(error);
        if (btn) btn.disabled = false;
        Swal.fire('Erro Fatal', 'Não foi possível conectar ao servidor.', 'error');
    }
}

// --- 3. FUNÇÃO DE LANÇAR EXAME ---
async function lancarExame() {
    const idPaciente = document.getElementById('exameIdPaciente').value;
    const nomeExame = document.getElementById('exameNome').value;
    const btn = document.querySelector('button[onclick="lancarExame()"]');

    if (!idPaciente || idPaciente == "0") {
        Swal.fire('Erro', 'Nenhum paciente selecionado.', 'error');
        return;
    }
    if (!nomeExame) {
        Swal.fire('Atenção', 'Selecione o nome do exame.', 'warning');
        return;
    }

    // Feedback visual
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = 'Lançando...';
    btn.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'salvarExame', 
                idPaciente: idPaciente,
                nomeExame: nomeExame
            })
        });

        const res = await response.json();

        btn.innerHTML = textoOriginal;
        btn.disabled = false;

        if (res.success) {
            Swal.fire('Sucesso', 'Exame lançado com sucesso!', 'success');
        } else {
            Swal.fire('Erro', 'Não foi possível salvar o exame.', 'error');
        }

    } catch (error) {
        console.error(error);
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
        Swal.fire('Erro', 'Falha de conexão.', 'error');
    }
}
