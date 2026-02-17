// ==========================================
// ADMIN.JS ATUALIZADO (MESMA URL)
// ==========================================

const API_URL = "https://script.google.com/macros/s/AKfycbyVI4pXYIM6GSEAl-TuqKdNPjaNIW7TEWM-rq9UdVh343htO3rb2GL8mVD1PDlaCcz77Q/exec";
const BRAND_COLOR = '#21409a'; 

async function buscarPaciente() {
    const termo = document.getElementById('buscaTermo').value;
    const btn = document.querySelector('button[onclick="buscarPaciente()"]');

    if (!termo) {
        Swal.fire({ title: 'Atenção', text: 'Digite o ID para buscar.', icon: 'warning', confirmButtonColor: BRAND_COLOR });
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

        // Parse Seguro
        const txt = await response.text();
        const res = JSON.parse(txt);

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
        console.error(error);
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
        Swal.fire({ title: 'Erro', text: 'Falha de conexão.', icon: 'error', confirmButtonColor: BRAND_COLOR });
    }
}

async function cadastrarPaciente() {
    const nome = document.getElementById('cadNome').value;
    const cpf = document.getElementById('cadCpf').value;
    const btn = document.getElementById('btnCadastrar');

    if (!nome || !cpf) {
        Swal.fire({ title: 'Atenção', text: 'Preencha os campos!', icon: 'warning', confirmButtonColor: BRAND_COLOR });
        return;
    }

    if (btn) btn.disabled = true;
    Swal.fire({ title: 'Processando...', text: 'Aguarde.', allowOutsideClick: false, showConfirmButton: false, didOpen: () => { Swal.showLoading(); } });

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'add_entry',
                entry_name: nome,
                entry_id: cpf 
            })
        });

        const txt = await response.text();
        const res = JSON.parse(txt);
        
        if (btn) btn.disabled = false;

        if (res.success) {
            document.getElementById('resUser').innerText = res.id_display;
            document.getElementById('resSenha').innerText = res.key_gen;
            document.getElementById('resId').innerText = res.internal_id;
            document.getElementById('resultadoCadastro').style.display = 'block';
            document.getElementById('exameIdPaciente').value = res.internal_id;
            document.getElementById('cadNome').value = '';
            document.getElementById('cadCpf').value = '';

            Swal.fire({ icon: 'success', title: 'Sucesso!', text: 'ID: ' + res.internal_id, timer: 3000, confirmButtonColor: BRAND_COLOR });
        }
    } catch (error) {
        if (btn) btn.disabled = false;
        console.error(error);
        Swal.fire({ title: 'Erro', text: 'Erro ao conectar.', icon: 'error', confirmButtonColor: BRAND_COLOR });
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

    if (!idPaciente || idPaciente == "0") return;

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

        const txt = await response.text();
        const res = JSON.parse(txt);

        btn.innerHTML = textoOriginal;
        btn.disabled = false;

        if (res.success) {
            Swal.fire({ title: 'OK', text: 'Lançado!', icon: 'success', confirmButtonColor: BRAND_COLOR });
        }
    } catch (error) {
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
        console.error(error);
    }
}
