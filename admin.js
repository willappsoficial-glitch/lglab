// ==========================================
// ARQUIVO: admin.js (VERSÃO FINAL BLINDADA)
// ==========================================

// --- 1. FUNÇÃO DE BUSCAR PACIENTE ---
function buscarPaciente() {
    const termo = document.getElementById('buscaTermo').value;
    const btn = document.querySelector('button[onclick="buscarPaciente()"]');

    if (!termo) {
        Swal.fire('Atenção', 'Digite um CPF ou Nome para buscar.', 'warning');
        return;
    }

    // Feedback visual (Trava botão)
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    google.script.run
        .withSuccessHandler(function(res) {
            // Destrava botão
            btn.innerHTML = textoOriginal;
            btn.disabled = false;

            if (res.success) {
                // Preenche o Bloco 2 (Resultado da Busca)
                document.getElementById('buscNome').innerText = res.nome;
                document.getElementById('buscCpf').innerText = res.cpf; // Mostra CPF com zero
                document.getElementById('buscId').innerText = res.id;
                
                // Mostra a caixa de resultado
                document.getElementById('resultadoBusca').style.display = 'block';

            } else {
                Swal.fire('Não encontrado', res.message, 'info');
                document.getElementById('resultadoBusca').style.display = 'none';
            }
        })
        .withFailureHandler(function(erro) {
            btn.innerHTML = textoOriginal;
            btn.disabled = false;
            Swal.fire('Erro', 'Falha ao buscar paciente.', 'error');
        })
        .buscarPaciente(termo);
}

// --- FUNÇÃO AUXILIAR: BOTÃO "USAR ID" ---
function usarIdEncontrado() {
    const idEncontrado = document.getElementById('buscId').innerText;
    if (idEncontrado && idEncontrado !== "...") {
        document.getElementById('exameIdPaciente').value = idEncontrado;
        // Foca no campo de nome do exame
        document.getElementById('exameNome').focus();
        // Feedback visual
        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'ID ' + idEncontrado + ' selecionado!',
            showConfirmButton: false,
            timer: 1500,
            toast: true
        });
    }
}

// --- 2. FUNÇÃO DE CADASTRAR PACIENTE (BLINDADA) ---
function cadastrarPaciente() {
    const nome = document.getElementById('cadNome').value;
    const cpf = document.getElementById('cadCpf').value;
    const btn = document.getElementById('btnCadastrar');

    // Validação
    if (!nome || !cpf) {
        Swal.fire('Atenção', 'Preencha todos os campos!', 'warning');
        return;
    }

    // === TRAVA TELA (Para evitar clique duplo e ansiedade) ===
    if (btn) btn.disabled = true;

    Swal.fire({
        title: 'Salvando...',
        text: 'Aguarde enquanto cadastramos.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => { Swal.showLoading(); }
    });

    google.script.run
        .withSuccessHandler(function(res) {
            // === DESTRAVA O BOTÃO (IMPORTANTE) ===
            if (btn) btn.disabled = false;

            if (res.success) {
                // Preenche os dados no Bloco 1 (Resultado)
                document.getElementById('resUser').innerText = res.cpf || cpf; // Garante visualização
                document.getElementById('resSenha').innerText = res.senha;
                document.getElementById('resId').innerText = res.id;
                
                document.getElementById('resultadoCadastro').style.display = 'block';
                
                // Já manda o ID para o Bloco 3 (Lançar Exame)
                document.getElementById('exameIdPaciente').value = res.id;

                // Limpa os campos de cadastro
                document.getElementById('cadNome').value = '';
                document.getElementById('cadCpf').value = '';

                // Sucesso
                Swal.fire({
                    icon: 'success',
                    title: 'Cadastrado!',
                    text: 'ID Gerado: ' + res.id,
                    timer: 3000,
                    showConfirmButton: true
                });

            } else {
                Swal.fire('Erro', res.message, 'error');
            }
        })
        .withFailureHandler(function(erro) {
            // Em caso de falha na internet, destrava o botão
            if (btn) btn.disabled = false;
            Swal.fire('Erro Fatal', 'Não foi possível conectar ao servidor.', 'error');
        })
        .cadastrarPaciente(nome, cpf);
}

// --- 3. FUNÇÃO DE LANÇAR EXAME ---
function lancarExame() {
    const idPaciente = document.getElementById('exameIdPaciente').value;
    const nomeExame = document.getElementById('exameNome').value;
    const btn = document.querySelector('button[onclick="lancarExame()"]');

    if (!idPaciente) {
        Swal.fire('Erro', 'Nenhum paciente selecionado. Busque ou cadastre um antes.', 'error');
        return;
    }
    if (!nomeExame) {
        Swal.fire('Atenção', 'Selecione ou digite o nome do exame.', 'warning');
        return;
    }

    // Feedback visual
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = 'Lançando...';
    btn.disabled = true;

    const dados = {
        action: 'salvarExame', 
        idPaciente: idPaciente,
        nomeExame: nomeExame
    };

    google.script.run
        .withSuccessHandler(function(res) {
            btn.innerHTML = textoOriginal;
            btn.disabled = false;

            if (res.success) {
                Swal.fire('Sucesso', 'Exame lançado para o paciente!', 'success');
                // Limpa só o campo do exame para facilitar lançar outro pro mesmo paciente
                // document.getElementById('exameNome').value = ''; 
            } else {
                Swal.fire('Erro', 'Não foi possível salvar.', 'error');
            }
        })
        .withFailureHandler(function(erro) {
            btn.innerHTML = textoOriginal;
            btn.disabled = false;
            Swal.fire('Erro', 'Falha de conexão.', 'error');
        })
        .salvarExame(dados);
}
