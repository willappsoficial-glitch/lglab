/**
 * CONFIGURAÇÃO PRINCIPAL
 * Cole abaixo a URL do seu App da Web do Google Apps Script
 */
const API_URL = "https://script.google.com/macros/s/AKfycbyVI4pXYIM6GSEAl-TuqKdNPjaNIW7TEWM-rq9UdVh343htO3rb2GL8mVD1PDlaCcz77Q/exec";

// ======================================================
// 1. LÓGICA DA TELA DE LOGIN (login.html)
// ======================================================

async function realizarLogin() {
    const userInput = document.getElementById('user');
    const passInput = document.getElementById('pass');
    const msg = document.getElementById('login-msg');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');

    if (!userInput.value || !passInput.value) {
        if(msg) msg.innerText = "Por favor, preencha todos os campos.";
        return;
    }

    if(btnText) btnText.classList.add('d-none');
    if(btnLoader) btnLoader.classList.remove('d-none');
    if(msg) msg.innerText = "";

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'login',
                usuario: userInput.value,
                senha: passInput.value
            })
        });

        const textoResposta = await response.text();
        let res;
        try {
            res = JSON.parse(textoResposta);
        } catch (e) {
            console.error("Erro ao ler JSON:", textoResposta);
            throw new Error("Erro de resposta do servidor.");
        }

        if (res.success) {
            localStorage.setItem('pacienteId', res.id);
            localStorage.setItem('pacienteNome', res.nome);
            window.location.href = 'dashboard.html';
        } else {
            if(msg) msg.innerText = "Usuário ou senha incorretos.";
            resetBtnLogin();
        }

    } catch (error) {
        console.error(error);
        if(msg) msg.innerText = "Erro de conexão. Tente novamente.";
        resetBtnLogin();
    }
}

function resetBtnLogin() {
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');
    if(btnText) btnText.classList.remove('d-none');
    if(btnLoader) btnLoader.classList.add('d-none');
}


// ======================================================
// 2. LÓGICA DO DASHBOARD (dashboard.html)
// ======================================================

async function carregarExames() {
    const id = localStorage.getItem('pacienteId');
    const nome = localStorage.getItem('pacienteNome');

    if (!id) {
        window.location.href = 'login.html';
        return;
    }

    const nomeElement = document.getElementById('client-name');
    if(nomeElement) nomeElement.innerText = nome;

    const list = document.getElementById('exames-list');
    if (!list) return;

    list.innerHTML = '<tr><td colspan="5" class="text-center py-4"><div class="spinner-border text-primary" role="status"></div><p class="mt-2 text-muted">Buscando seus exames...</p></td></tr>';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'buscarExames',
                idPaciente: id
            })
        });

        const textoResposta = await response.text();
        const exames = JSON.parse(textoResposta);
        renderizarTabela(exames, list);

    } catch (error) {
        console.error(error);
        list.innerHTML = '<tr><td colspan="5" class="text-center text-danger fw-bold">Erro ao carregar dados. Recarregue a página.</td></tr>';
    }
}

function renderizarTabela(exames, elementoTabela) {
    if (exames.length === 0) {
        elementoTabela.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nenhum exame encontrado.</td></tr>';
        return;
    }

    let html = '';
    exames.forEach(ex => {
        let acao = '';
        
        let dataExibicao = ex.data; 
        try {
            let dataObj = new Date(ex.data);
            if (!isNaN(dataObj.getTime())) {
                let dia = String(dataObj.getUTCDate()).padStart(2, '0');
                let mes = String(dataObj.getUTCMonth() + 1).padStart(2, '0');
                let ano = dataObj.getUTCFullYear();
                dataExibicao = `${dia}/${mes}/${ano}`;
            }
        } catch (erro) {
            console.log("Erro data:", erro);
        }

        let statusTexto = ex.status ? String(ex.status).trim() : "";
        let statusParaComparar = statusTexto.toLowerCase();
        let pagamentoNormalizado = ex.pagamento ? ex.pagamento.trim().toLowerCase() : "";
        let temLink = ex.link && ex.link.length > 10;
        
        let corBg = "#fd7e14"; 
        if (statusParaComparar === 'pronto') corBg = "#198754";
        
        let styleStatus = `background-color: ${corBg} !important; color: white !important; border: none !important;`;

        let corPag = pagamentoNormalizado === 'pago' 
            ? "background-color: #198754 !important; color: white !important;" 
            : "background-color: #dc3545 !important; color: white !important;";

        if (pagamentoNormalizado === 'pendente') {
            acao = `<button onclick="pagarPix('${ex.nome}')" class="btn btn-sm btn-primary shadow-sm"><i class="fas fa-qrcode me-1"></i> Pagar</button>`;
        } else if (pagamentoNormalizado === 'pago') {
            if(temLink && statusParaComparar === 'pronto') {
                 acao = `<a href="${ex.link}" target="_blank" class="btn btn-sm btn-success shadow-sm"><i class="fas fa-download me-1"></i> PDF</a>`;
            } else {
                 acao = `<span class="text-muted small"><i class="fas fa-hourglass-half"></i> Aguarde</span>`;
            }
        } else {
            acao = `<span class="text-muted small"><i class="fas fa-hourglass-half"></i> Aguarde</span>`;
        }

        html += `
            <tr>
                <td data-label="Exame"><strong>${ex.nome}</strong></td>
                <td data-label="Data">${dataExibicao}</td>
                <td data-label="Status"><span class="badge" style="${styleStatus}">${statusTexto}</span></td>
                <td data-label="Pagamento"><span class="badge" style="${corPag}">${ex.pagamento}</span></td>
                <td data-label="Ação" class="text-end">${acao}</td>
            </tr>`;
    });
    elementoTabela.innerHTML = html;
}

// ... Manter funções logout e pagarPix (são apenas frontend) ...
function logout() {
    localStorage.removeItem('pacienteId');
    localStorage.removeItem('pacienteNome');
    window.location.href = 'index.html';
}

function pagarPix(nomeExame) {
    // Código PIX e Lógica do SweetAlert
    const pixPayload = "00020126330014BR.GOV.BCB.PIX0111092503854715204000053039865802BR5925Francisco Williano Pereir6009SAO PAULO62140510xS9tq7FMms6304B42F"; 
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixPayload)}`;

    Swal.fire({
        title: 'Pagamento via PIX',
        html: `
            <p class="mb-3">Libere o resultado de <strong>${nomeExame}</strong>.</p>
            <div class="bg-white p-3 rounded mb-3 border d-inline-block">
                <img src="${qrCodeUrl}" class="img-fluid" style="max-width: 200px">
            </div>
            <p class="small text-muted mb-2">Aponte a câmera do seu celular</p>
            <div class="input-group mb-3">
                <input type="text" class="form-control form-control-sm" value="${pixPayload}" id="pixCopiaCola" readonly>
                <button class="btn btn-outline-secondary btn-sm" onclick="copiarPix()">Copiar</button>
            </div>
        `,
        confirmButtonText: 'Já fiz o pagamento',
        confirmButtonColor: '#21409a',
        showCancelButton: true,
        cancelButtonText: 'Fechar'
    });
}

function copiarPix() {
    const copyText = document.getElementById("pixCopiaCola");
    copyText.select();
    copyText.setSelectionRange(0, 99999); 
    navigator.clipboard.writeText(copyText.value);
}
