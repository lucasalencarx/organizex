const client = supabase.createClient(
  "https://sdazaoxspcmyqenselmf.supabase.co",
  "sb_publishable_cWIwZ6SagFpcly9NdcG11A_HW6WbS76"
);

let todasAnotacoes = [];

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

  window.location.href =
  "../dashboard.html";

}

/* CARREGAR */

async function carregarAnotacoes(){

  const { data, error } = await client

    .from("anotacoes")

    .select("*")

    .order("horario", {
      ascending:true
    });

  if(error){

    console.log(error);

    mostrarToast("Erro ao carregar");

    return;

  }

  todasAnotacoes = data || [];

  renderizar(todasAnotacoes);

}

/* TOTAL */

function atualizarTotal(lista){

  document
  .getElementById("totalAnotacoes")
  .innerText = lista.length;

}

/* RENDER */

function renderizar(lista){

  const container =
  document.getElementById("listaAnotacoes");

  container.innerHTML = "";

  lista.forEach(a => {

    const horario =
    new Date(a.horario)
    .toLocaleString("pt-BR");

    const vencido =
    new Date(a.horario) < new Date();

    container.innerHTML += `

    <div class="chat-item">

      <!-- FOTO -->

      <div class="chat-foto">

        <img src="perfil.png">

      </div>

      <!-- BALÃO -->

      <div class="chat-balao
      ${vencido ? 'vencido' : ''}">

        <div class="chat-top">

          <span class="chat-data">

            📅 ${horario}

          </span>

          ${vencido

            ? `<span class="tag-vencido">
                Finalizado
              </span>`

            : `<span class="tag-hoje">
                Pendente
              </span>`
          }

        </div>

        <div class="chat-linha">

          <strong>Compromisso:</strong>

          ${a.compromisso || "--"}

        </div>

        <div class="chat-linha">

          <strong>Local:</strong>

          ${a.local || "--"}

        </div>

        <div class="chat-linha">

          <strong>Obs:</strong>

          ${a.observacao || "--"}

        </div>

      </div>

      <!-- AÇÕES -->

      <div class="chat-acoes">

        <button
        class="btn-editar"
        onclick="editar('${a.id}')">

          <i class="fa-solid fa-pen"></i>

        </button>

        <button
        class="btn-excluir"
        onclick="excluirAnotacao('${a.id}')">

          <i class="fa-solid fa-trash"></i>

        </button>

      </div>

    </div>

    `;

  });

  atualizarTotal(lista);

}

/* FILTROS */

function filtrar(tipo){

  if(tipo === "todos"){

    renderizar(todasAnotacoes);
    return;

  }

  const hoje = new Date();

  const filtradas =
  todasAnotacoes.filter(a => {

    const data =
    new Date(a.horario);

    if(tipo === "hoje"){

      return (

        data.getDate() === hoje.getDate()

        &&

        data.getMonth() === hoje.getMonth()

        &&

        data.getFullYear() === hoje.getFullYear()

      );

    }

    if(tipo === "amanha"){

      const amanha =
      new Date();

      amanha.setDate(
        amanha.getDate() + 1
      );

      return (

        data.getDate() === amanha.getDate()

        &&

        data.getMonth() === amanha.getMonth()

        &&

        data.getFullYear() === amanha.getFullYear()

      );

    }

  });

  renderizar(filtradas);

}

/* NOVA */

function novaAnotacao(){

  editandoId = null;

  document
  .getElementById("formAnotacao")
  .reset();

  document
  .querySelector(".modal-top h2")
  .innerText =
  "Novo Compromisso";

  document
  .querySelector(".btn-salvar")
  .innerText =
  "Salvar Compromisso";

  document
  .getElementById("modalAnotacao")
  .classList.add("ativo");

}

/* FECHAR */

function fecharModal(){

  document
  .getElementById("modalAnotacao")
  .classList.remove("ativo");

}

/* EDITAR */

function editar(id){

  const item =
  todasAnotacoes.find(
    a => a.id == id
  );

  if(!item) return;

  editandoId = id;

  document
  .querySelector(".modal-top h2")
  .innerText =
  "Editar Compromisso";

  document
  .querySelector(".btn-salvar")
  .innerText =
  "Salvar Alterações";

  document
  .getElementById("compromisso")
  .value =
  item.compromisso || "";

  document
  .getElementById("local")
  .value =
  item.local || "";

  document
  .getElementById("horario")
  .value =
  item.horario
    ? item.horario.slice(0,16)
    : "";

  document
  .getElementById("observacao")
  .value =
  item.observacao || "";

  document
  .getElementById("modalAnotacao")
  .classList.add("ativo");

}

/* EXCLUIR */

function excluirAnotacao(id){

  idExcluir = id;

  document
  .getElementById("modalExcluir")
  .classList.add("show");

}

/* FECHAR EXCLUIR */

function fecharExcluir(){

  document
  .getElementById("modalExcluir")
  .classList.remove("show");

}

/* CONFIRMAR */

async function confirmarExcluir(){

  if(!idExcluir) return;

  await client

    .from("anotacoes")

    .delete()

    .eq("id", idExcluir);

  fecharExcluir();

  mostrarToast(
    "Compromisso excluído"
  );

  carregarAnotacoes();

}

/* FORM */

window.addEventListener(
"DOMContentLoaded", ()=>{

  carregarAnotacoes();

  const form =
  document.getElementById(
    "formAnotacao"
  );

  form.addEventListener(
  "submit", async(e)=>{

    e.preventDefault();

    const compromisso =
    document
    .getElementById("compromisso")
    .value.trim();

    const local =
    document
    .getElementById("local")
    .value.trim();

    const horario =
    document
    .getElementById("horario")
    .value;

    const observacao =
    document
    .getElementById("observacao")
    .value.trim();

    if(!compromisso || !horario){

      mostrarToast(
        "Preencha os campos"
      );

      return;

    }

    let error = null;

    /* EDITAR */

    if(editandoId){

      const resposta =
      await client

        .from("anotacoes")

        .update({

          compromisso,
          local,
          horario,
          observacao

        })

        .eq("id", editandoId);

      error = resposta.error;

      if(!error){

        mostrarToast(
          "Atualizado"
        );

      }

    }

    /* NOVO */

    else{

      const resposta =
      await client

        .from("anotacoes")

        .insert([{

          compromisso,
          local,
          horario,
          observacao,

          created_at:
          new Date()
          .toISOString()

        }]);

      error = resposta.error;

      if(!error){

        mostrarToast(
          "Compromisso criado"
        );

      }

    }

    if(error){

      console.log(error);

      mostrarToast(
        "Erro ao salvar"
      );

      return;

    }

    form.reset();

    fecharModal();

    editandoId = null;

    carregarAnotacoes();

  });

});

/* AUTO LOAD */

window.onload =
carregarAnotacoes;