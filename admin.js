// ==========================================
// ARQUIVO: admin.js (ATUALIZADO LG LAB)
// ==========================================

// URL da API (Mantida a mesma)
const API_URL = "https://script.google.com/macros/s/AKfycbyVI4pXYIM6GSEAl-TuqKdNPjaNIW7TEWM-rq9UdVh343htO3rb2GL8mVD1PDlaCcz77Q/exec";

// Cor Oficial LG Lab (Azul) para os botões dos alertas
const BRAND_COLOR = '#21409a'; 

// --- 1. FUNÇÃO DE BUSCAR PACIENTE ---
async function buscarPaciente() {
    const termo = document.getElementById('buscaTermo').value;
    const btn = document.querySelector('button[onclick="buscarPaciente()"]');

    if (!termo) {
        Swal.fire({
            title: 'Atenção',
            text: 'Digite um CPF ou Nome para buscar.',
            icon: 'warning',
            confirmButtonColor: BRAND_COLOR
        });
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
            Swal.fire({
                title: 'Não encontrado',
                text: res.message || 'Paciente não localizado.',
                icon: 'info',
                confirmButtonColor: BRAND_COLOR
            });
            document.getElementById('resultadoBusca').style.display = 'none';
        }

    } catch (error) {
        console.error(error);
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
        Swal.fire({
            title: 'Erro',
            text: 'Falha de conexão com o servidor.',
            icon: 'error',
            confirmButtonColor: BRAND_COLOR
        });
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
        Swal.fire({
            title: 'Atenção',
            text: 'Preencha todos os campos!',
            icon: 'warning',
            confirmButtonColor: BRAND_COLOR
        });
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
                confirmButtonColor: BRAND_COLOR // Botão azul
            });

        } else {
            Swal.fire({
                title: 'Erro',
                text: res.message || 'Erro ao cadastrar.',
                icon: 'error',
                confirmButtonColor: BRAND_COLOR
            });
        }

    } catch (error) {
        console.error(error);
        if (btn) btn.disabled = false;
        Swal.fire({
            title: 'Erro Fatal',
            text: 'Não foi possível conectar ao servidor.',
            icon: 'error',
            confirmButtonColor: BRAND_COLOR
        });
    }
}

// --- 3. FUNÇÃO DE LANÇAR EXAME ---
async function lancarExame() {
    const idPaciente = document.getElementById('exameIdPaciente').value;
    const nomeExame = document.getElementById('exameNome').value;
    const btn = document.querySelector('button[onclick="lancarExame()"]');

    if (!idPaciente || idPaciente == "0") {
        Swal.fire({
            title: 'Erro',
            text: 'Nenhum paciente selecionado.',
            icon: 'error',
            confirmButtonColor: BRAND_COLOR
        });
        return;
    }
    if (!nomeExame) {
        Swal.fire({
            title: 'Atenção',
            text: 'Selecione o nome do exame.',
            icon: 'warning',
            confirmButtonColor: BRAND_COLOR
        });
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
            Swal.fire({
                title: 'Sucesso',
                text: 'Exame lançado com sucesso!',
                icon: 'success',
                confirmButtonColor: BRAND_COLOR
            });
        } else {
            Swal.fire({
                title: 'Erro',
                text: 'Não foi possível salvar o exame.',
                icon: 'error',
                confirmButtonColor: BRAND_COLOR
            });
        }

    } catch (error) {
        console.error(error);
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
        Swal.fire({
            title: 'Erro',
            text: 'Falha de conexão.',
            icon: 'error',
            confirmButtonColor: BRAND_COLOR
        });
    }
}
