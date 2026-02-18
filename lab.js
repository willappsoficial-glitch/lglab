/**
 * LÓGICA DA ÁREA TÉCNICA (LABORATÓRIO)
 */
// Use a MESMA URL que você usa no admin.js e script.js
const API_URL = "https://script.google.com/macros/s/AKfycbyVI4pXYIM6GSEAl-TuqKdNPjaNIW7TEWM-rq9UdVh343htO3rb2GL8mVD1PDlaCcz77Q/exec";

async function buscarPendentes() {
    const id = document.getElementById('labIdPaciente').value;
    
    if(!id) {
        Swal.fire('Ops', 'Digite o ID do paciente.', 'warning');
        return;
    }

    Swal.showLoading();

    try {
        // Reutilizamos a função de buscar exames do cliente, mas filtramos aqui
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'buscarExames',
                idPaciente: id
            })
        });

        const exames = await response.json();
        Swal.close();

        // Filtra apenas os que NÃO estão prontos (ou seja, Status != Pronto)
        const pendentes = exames.filter(ex => ex.status.toLowerCase() !== 'pronto');

        if(pendentes.length === 0) {
            Swal.fire('Tudo certo!', 'Não há exames pendentes para este paciente.', 'info');
            document.getElementById('areaUpload').style.display = 'none';
            return;
        }

        // Popula o Select
        const select = document.getElementById('labSelectExame');
        select.innerHTML = '';
        pendentes.forEach(ex => {
            const option = document.createElement('option');
            option.value = ex.nome;
            option.text = `${ex.nome} (Data: ${formatarData(ex.data)})`;
            select.appendChild(option);
        });

        document.getElementById('areaUpload').style.display = 'block';

    } catch (e) {
        Swal.fire('Erro', 'Não foi possível buscar os exames.', 'error');
    }
}

async function enviarPDF() {
    const id = document.getElementById('labIdPaciente').value;
    const nomeExame = document.getElementById('labSelectExame').value;
    const inputFile = document.getElementById('labArquivo');

    if (inputFile.files.length === 0) {
        Swal.fire('Atenção', 'Selecione o arquivo PDF do exame.', 'warning');
        return;
    }

    const arquivo = inputFile.files[0];
    
    // Leitura do arquivo para Base64
    const reader = new FileReader();
    reader.readAsDataURL(arquivo);
    
    reader.onload = async function() {
        const base64 = reader.result; // Contém o arquivo codificado

        Swal.fire({
            title: 'Enviando...',
            text: 'Fazendo upload para o Drive e liberando acesso.',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'upload_pdf',
                    id_paciente: id,
                    nome_exame: nomeExame,
                    nome_arquivo: `${id}_${nomeExame}.pdf`, // Nome padrão para salvar no Drive
                    arquivo_base64: base64
                })
            });

            const res = await response.json();

            if (res.success) {
                Swal.fire('Sucesso!', 'Exame enviado e liberado para o paciente.', 'success');
                // Limpa e esconde
                document.getElementById('labArquivo').value = '';
                document.getElementById('areaUpload').style.display = 'none';
            } else {
                Swal.fire('Erro', res.message, 'error');
            }

        } catch (e) {
            Swal.fire('Erro', 'Falha na conexão de upload.', 'error');
        }
    };
}

function formatarData(dataISO) {
    try {
        let dataObj = new Date(dataISO);
        let dia = String(dataObj.getUTCDate()).padStart(2, '0');
        let mes = String(dataObj.getUTCMonth() + 1).padStart(2, '0');
        return `${dia}/${mes}`;
    } catch (e) { return dataISO; }
}