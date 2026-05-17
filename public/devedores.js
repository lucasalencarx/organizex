const client = supabase.createClient(
  "https://sdazaoxspcmyqenselmf.supabase.co",
  "sb_publishable_cWIwZ6SagFpcly9NdcG11A_HW6WbS76"
);

let todos = [];
let devedorSelecionado = null;
let idExcluir = null;

/* CARREGAR */
async function carregarDevedores(){

  const { data } = await client
    .from("devedores")
    .select(`*, juros_pagamentos(*)`)
    .order("created_at", { ascending:false });

  todos = data || [];
  renderizar(todos);
}


function voltarDashboard(){
  window.location.href = "../dashboard.html";
}

/* RENDER */
function renderizar(lista){

  const el = document.getElementById("listaDevedores");
  el.innerHTML = "";

  lista.forEach(d => {


    const totalPago = d.juros_pagamentos?.reduce((acc, j) => {
  return acc + Number(j.valor_pago || 0);
}, 0) || 0;

const valorEmprestado = Number(d.valor);

const quitouEmprestimo = totalPago >= valorEmprestado;
const faltando = valorEmprestado - totalPago;

    const juros = d.juros ? `SIM (${d.juros}%)` : "NÃO";
    const total = Number(d.valor) + (d.valor * (d.juros || 0) / 100);

    const whatsapp = d.telefone
      ? `https://wa.me/55${d.telefone.replace(/\D/g,'')}`
      : null;

    el.innerHTML += `
      <div class="chat-item">

        <div class="chat-foto">
          <img src="perfil.png">
        </div>

        <div class="chat-balao">

          <div class="chat-top">
            <span>📅 ${new Date(d.created_at).toLocaleDateString()}</span>
          </div>

          <div class="chat-linha"><b>${d.devedor}</b></div>
          <div class="chat-linha">${d.telefone || "--"}</div>
          <div class="chat-linha">Valor: R$ ${Number(d.valor).toFixed(2)}</div>
          <div class="chat-linha">Juros: ${juros}</div>

<div class="chat-linha">
  📈 Valor do juros: R$ ${(d.valor * (d.juros || 0) / 100).toFixed(2)}
</div>

          <div class="chat-linha">
            💰 Total: <b>R$ ${total.toFixed(2)}</b>
          </div>

          <div class="chat-linha">${d.obs || "--"}</div>

          <div class="chat-extrato">

            <strong>📊 Juros pagos:</strong>

           ${
  quitouEmprestimo
    ? `<div class="extrato-item" style="background:#dcfce7;color:#166534;font-weight:700;">
        ✅ Valor total emprestado recuperado, daqui pra frente só juros LUCRO!
      </div>`
    : `<div class="extrato-item" style="background:#fef3c7;color:#92400e;font-weight:700;">
        ⚠️ Falta R$ ${faltando.toFixed(2)} para seu dinheiro emprestado ser recuperado!
      </div>`
}

            ${
              d.juros_pagamentos?.length
              ? d.juros_pagamentos.map(j => `
                <div class="extrato-item">
                  📅 ${j.mes} | 💰 R$ ${Number(j.valor_pago).toFixed(2)}
                  ${j.comprovante_url ? "📎" : ""}
                </div>
              `).join("")
              : "<div class='extrato-vazio'>Nenhum pagamento ainda</div>"
            }

          </div>

        </div>

        <div class="chat-acoes">

          ${whatsapp ? `
            <a class="btn-whatsapp" href="${whatsapp}" target="_blank">
              <i class="fa-brands fa-whatsapp"></i>
            </a>` : ""}

          <button class="btn-juros" onclick="abrirJuros('${d.id}')">💰</button>

          <button class="btn-excluir" onclick="abrirExcluir('${d.id}')">🗑</button>

        </div>

      </div>
    `;
  });
}

/* =========================
   EXCLUIR (CORRIGIDO)
========================= */

function abrirExcluir(id){
  idExcluir = id;
  document.getElementById("modalExcluir").classList.add("show");
}

function fecharExcluir(){
  document.getElementById("modalExcluir").classList.remove("show");
}

async function confirmarExcluir(){

  await client
    .from("devedores")
    .delete()
    .eq("id", idExcluir);

  fecharExcluir();
  carregarDevedores();
}

/* =========================
   DEVEDOR
========================= */

function novoDevedor(){
  document.getElementById("modalDevedor").classList.add("ativo");
}

function fecharModal(){
  document.getElementById("modalDevedor").classList.remove("ativo");
}

document.getElementById("formDevedor").addEventListener("submit", async (e)=>{

  e.preventDefault();

  await client.from("devedores").insert([{
    devedor: devedor.value,
    telefone: telefone.value,
    valor: valor.value,
    juros: juros.value,
    obs: obs.value,
    created_at: new Date().toISOString()
  }]);

  fecharModal();
  carregarDevedores();
});

/* =========================
   JUROS
========================= */

function abrirJuros(id){
  devedorSelecionado = id;
  document.getElementById("modalJuros").classList.add("ativo");
}

function fecharJuros(){
  document.getElementById("modalJuros").classList.remove("ativo");
}

document.getElementById("formJuros").addEventListener("submit", async (e)=>{

  e.preventDefault();

  let file = document.getElementById("comprovante").files[0];
  let url = "";

  if(file){
    const name = Date.now() + file.name;

    const { data } = await client.storage
      .from("comprovantes")
      .upload(name, file);

    url = data?.path || "";
  }

  await client.from("juros_pagamentos").insert([{
    devedor_id: devedorSelecionado,
    mes: mes.value,
    valor_pago: valor_pago.value,
    comprovante_url: url
  }]);

  fecharJuros();
  carregarDevedores();
});

window.onload = carregarDevedores;