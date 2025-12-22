// ==========================================
// ARQUIVO: admin.js (COMPLETO E ATUALIZADO)
// ==========================================

// --- 1. FUNÇÃO DE BUSCAR PACIENTE ---
function cadastrarPaciente() {
    const nome = document.getElementById('cadNome').value;
    const cpf = document.getElementById('cadCpf').value;

    // Validação básica
    if (!nome || !cpf) {
        Swal.fire('Atenção', 'Preencha todos os campos!', 'warning');
        return;
    }

    // === MÁGICA DO BLOQUEIO DE TELA ===
    // Isso abre um popup que não deixa clicar fora e mostra o giratório
    Swal.fire({
        title: 'Processando...',
        text: 'Aguarde enquanto realizamos o cadastro.',
        allowOutsideClick: false, // Não deixa fechar clicando fora
        allowEscapeKey: false,    // Não deixa fechar com ESC
        didOpen: () => {
            Swal.showLoading(); // Ativa a animação de carregamento
        }
    });
    // ==================================

    google.script.run
        .withSuccessHandler(function(res) {
            // Quando o Google responde, o Swal de sucesso SUBSTITUI o de carregamento automaticamente
            
            if (res.success) {
                // Preenche os dados na tela
                document.getElementById('resUser').innerText = res.id;
                document.getElementById('resSenha').innerText = res.senha;
                document.getElementById('resId').innerText = res.id;
                document.getElementById('resultadoCadastro').style.display = 'block';
                
                document.getElementById('exameIdPaciente').value = res.id;

                // Limpa campos
                document.getElementById('cadNome').value = '';
                document.getElementById('cadCpf').value = '';
                
                // Mensagem de Sucesso
                Swal.fire({
                    icon: 'success',
                    title: 'Sucesso!',
                    text: 'Paciente cadastrado com ID ' + res.id,
                    timer: 3000, // Fecha sozinho em 3 segundos (opcional)
                    showConfirmButton: true
                });

            } else {
                Swal.fire('Erro', res.message, 'error');
            }
        })
        .withFailureHandler(function(erro) {
            Swal.fire('Erro Fatal', 'Falha na comunicação com o servidor.', 'error');
        })
        .cadastrarPaciente(nome, cpf);
}
// --- 2. FUNÇÃO DE CADASTRAR PACIENTE (COM A PROTEÇÃO DE LOOP) ---
function cadastrarPaciente() {
    const nome = document.getElementById('cadNome').value;
    const cpf = document.getElementById('cadCpf').value;
    const btn = document.getElementById('btnCadastrar'); // Certifique-se que o botão tem id="btnCadastrar"

    // Validação
    if (!nome || !cpf) {
        Swal.fire('Atenção', 'Preencha todos os campos!', 'warning');
        return;
    }

    // === TRAVA TELA (Para evitar clique duplo) ===
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
            // === DESTRAVA O BOTÃO ===
            if (btn) btn.disabled = false;

            if (res.success) {
                // Preenche os dados no Bloco 3
                document.getElementById('resUser').innerText = res.cpf || cpf; 
                document.getElementById('resSenha').innerText = res.senha;
                document.getElementById('resId').innerText = res.id;
                
                document.getElementById('resultadoCadastro').style.display = 'block';
                document.getElementById('exameIdPaciente').value = res.id;

                // Limpa os campos de cadastro
                document.getElementById('cadNome').value = '';
                document.getElementById('cadCpf').value = '';

                // Sucesso
                Swal.fire({
                    icon: 'success',
                    title: 'Cadastrado!',
                    text: 'Paciente salvo com sucesso.',
                    timer: 2000,
                    showConfirmButton: false
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
        action: 'salvarExame', // Importante para o novo doPost
        idPaciente: idPaciente,
        nomeExame: nomeExame
    };

    google.script.run
        .withSuccessHandler(function(res) {
            btn.innerHTML = textoOriginal;
            btn.disabled = false;

            if (res.success) {
                Swal.fire('Sucesso', 'Exame lançado para o paciente!', 'success');
                // Limpa só o campo do exame
                document.getElementById('exameNome').value = ''; 
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

