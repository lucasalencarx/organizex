const client = supabase.createClient(
  "https://sdazaoxspcmyqenselmf.supabase.co",
  "sb_publishable_cWIwZ6SagFpcly9NdcG11A_HW6WbS76"
);

let todasDividas = [];


let idExcluir = null;

let editandoId = null;

/* TOAST */

function mostrarToast(msg){

  const toast =
  document.getElementById("toast");

  const texto =
  document.getElementById("toastText");

  texto.innerText = msg;

  toast.classList.add("show");

  setTimeout(()=>{

    toast.classList.remove("show");

  }, 2500);

}

/* VOLTAR */
function voltarDashboard(){
  window.location.href = "../dashboard.html";
}

/* CARREGAR DADOS */
async function carregarDividas(){

  const { data, error } = await client
    .from("dividas")
    .select("*")
    .order("created_at", { ascending:false });

  if(error){
    alert("Erro ao buscar dados");
    return;
  }

  todasDividas = data || [];

  renderizar(todasDividas);
}

/* RENDERIZAR */
function renderizar(lista){

  const container =
  document.getElementById("listaDividas");

  container.innerHTML = "";

  lista.forEach(d => {

    const dataFormatada =
    d.data_cadastro
      ? new Date(d.data_cadastro)
          .toLocaleDateString('pt-BR')
      : "--";

    const tipoClasse =
      d.tipo === "institucional"
      ? "tag-institucional"
      : "tag-pessoal";

    container.innerHTML += `

    <div class="chat-item">

      <!-- FOTO -->

     <div class="chat-foto">
  <img src="perfil.png">
</div>

      <!-- BALÃO -->

      <div class="chat-balao">

        <div class="chat-top">

          <span class="chat-data">
            📅 ${dataFormatada}
          </span>

          <span class="tag-tipo ${tipoClasse}">
            ${d.tipo || "--"}
          </span>

        </div>

        <div class="chat-linha">
          <strong>Descrição:</strong>
          ${d.descricao || "--"}
        </div>

        <div class="chat-linha">
          <strong>Valor:</strong>

          <span class="chat-valor">
            R$ ${Number(d.valor || 0).toFixed(2)}
          </span>
        </div>

        <div class="chat-linha">
          <strong>Pessoa:</strong>
          ${d.pessoa || "--"}
        </div>

        <div class="chat-linha">
          <strong>Obs:</strong>
          ${d.obs || "--"}
        </div>

      </div>

      <!-- AÇÕES -->

      <div class="chat-acoes">

        <button
        class="btn-editar"
        onclick="editar('${d.id}')">

          <i class="fa-solid fa-pen"></i>

        </button>

        <button
        class="btn-excluir"
        onclick="excluirDivida('${d.id}')">

          <i class="fa-solid fa-trash"></i>

        </button>

      </div>

    </div>

    `;

  });

}

/* FILTRAR */
function filtrar(tipo){

  if(tipo === "todas"){
    renderizar(todasDividas);
    return;
  }

  const filtradas =
  todasDividas.filter(
    d => d.tipo === tipo
  );

  renderizar(filtradas);

}

/* PAGAR */
async function pagar(id){

  alert("Função pagar desativada");

}

/* EDITAR */
/* EDITAR */

function editar(id){

  const divida =
  todasDividas.find(d => d.id == id);

  if(!divida) return;

  editandoId = id;

  document
  .querySelector(".modal-top h2")
  .innerText = "Editar Dívida";

  document
  .querySelector(".btn-salvar")
  .innerText = "Salvar Alterações";

  document
  .getElementById("descricao")
  .value = divida.descricao || "";

  document
  .getElementById("valor")
  .value = divida.valor || "";

  document
  .getElementById("tipo")
  .value = divida.tipo || "pessoal";

  document
  .getElementById("pessoa")
  .value = divida.pessoa || "";

  document
  .getElementById("obs")
  .value = divida.obs || "";

  document
  .getElementById("modalDivida")
  .classList.add("ativo");

}

/* EXCLUIR */
/* ABRIR MODAL EXCLUIR */

function excluirDivida(id){

  idExcluir = id;

  document
  .getElementById("modalExcluir")
  .classList.add("show");

}

/* FECHAR MODAL */

function fecharExcluir(){

  document
  .getElementById("modalExcluir")
  .classList.remove("show");

}

/* CONFIRMAR EXCLUSÃO */

async function confirmarExcluir(){

  if(!idExcluir) return;

  await client
    .from("dividas")
    .delete()
    .eq("id", idExcluir);

  fecharExcluir();

  mostrarToast("Dívida excluída");

  carregarDividas();

}

/* NOVA DÍVIDA */
/* ABRIR MODAL */
/* ABRIR MODAL */
/* NOVA DÍVIDA */

function novaDivida(){

  editandoId = null;

  document
  .getElementById("formDivida")
  .reset();

  document
  .querySelector(".modal-top h2")
  .innerText = "Nova Dívida";

  document
  .querySelector(".btn-salvar")
  .innerText = "Salvar Dívida";

  document
  .getElementById("modalDivida")
  .classList.add("ativo");

}

/* FECHAR MODAL */
function fecharModal(){

  document
  .getElementById("modalDivida")
  .classList.remove("ativo");

}

/* FORM */

window.addEventListener("DOMContentLoaded", ()=>{

  const form =
  document.getElementById("formDivida");

form.addEventListener("submit", async(e)=>{

  e.preventDefault();

  const descricao =
  document.getElementById("descricao")
  .value.trim();

  const valor =
  document.getElementById("valor")
  .value;

  const tipo =
  document.getElementById("tipo")
  .value;

  const pessoa =
  document.getElementById("pessoa")
  .value.trim();

  const obs =
  document.getElementById("obs")
  .value.trim();

  if(!descricao || !valor){

    mostrarToast("Preencha os campos");
    return;

  }

  let error = null;

  /* EDITAR */

  if(editandoId){

    const resposta = await client
      .from("dividas")
      .update({

        descricao,
        valor,
        tipo,
        pessoa,
        obs

      })
      .eq("id", editandoId);

    error = resposta.error;

    if(!error){

      mostrarToast("Atualizado com sucesso");

    }

  }

  /* NOVA */

  else{

    const resposta = await client
      .from("dividas")
      .insert([{

        descricao,
        valor,
        tipo,
        pessoa,
        obs,

        data_cadastro:
        new Date().toISOString(),

        created_at:
        new Date().toISOString()

      }]);

    error = resposta.error;

    if(!error){

      mostrarToast("Dívida adicionada");

    }

  }

  if(error){

    console.log(error);

    mostrarToast("Erro ao salvar");

    return;

  }

  form.reset();

  fecharModal();

  editandoId = null;

  carregarDividas();

});
});

/* FECHAR MODAL */
function fecharModal(){

  document
  .getElementById("modalDivida")
  .classList.remove("ativo");

}

/* AUTO LOAD */
window.onload = carregarDividas;


