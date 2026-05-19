<!-- SUPABASE -->

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<script>

/* =========================
   SUPABASE
========================= */

const client = supabase.createClient(
  "https://sdazaoxspcmyqenselmf.supabase.co",
  "SUA_PUBLIC_KEY"
);

/* =========================
   VARIAVEIS
========================= */

let lucroTotal = 0;
let produtoEditando = null;

/* =========================
   CARREGAR LOJA
========================= */

async function carregarLoja(){

    const { data } = await client
    .from("loja")
    .select("*")
    .limit(1)
    .single();

    if(!data) return;

    document.getElementById("saldo")
    .innerHTML = Number(data.saldo)
    .toLocaleString("pt-BR",{
        style:"currency",
        currency:"BRL"
    });

    document.getElementById("lucroTotal")
    .innerHTML = Number(data.lucro_total)
    .toLocaleString("pt-BR",{
        style:"currency",
        currency:"BRL"
    });

}

/* =========================
   CARREGAR PRODUTOS
========================= */

async function carregarProdutos(){

    const { data } = await client
    .from("produtos")
    .select("*")
    .order("id", { ascending:false });

    renderizarProdutos(data || []);

}

/* =========================
   RENDER
========================= */

function renderizarProdutos(lista){

    const el =
    document.getElementById("lista");

    el.innerHTML = "";

    lista.forEach(p => {

        el.innerHTML += `

        <div class="produto">

            <div class="header-produto">

                <div>

                    <div class="nome">
                        ${p.nome}
                    </div>

                    <div class="categoria">
                        ${p.categoria || "--"}
                    </div>

                </div>

                <div class="status ${p.status == 'VENDIDO' ? 'vendido' : 'estoque'}">
                    ${p.status}
                </div>

            </div>

            <div class="info-scroll">

                <div class="info">
                    <span>Comprado</span>
                    <strong>
                        ${dinheiro(p.comprado)}
                    </strong>
                </div>

                <div class="info">
                    <span>Venda</span>
                    <strong>
                        ${dinheiro(p.venda)}
                    </strong>
                </div>

                <div class="info">
                    <span>Lucro</span>
                    <strong>
                        ${dinheiro(p.lucro)}
                    </strong>
                </div>

                <div class="info">
                    <span>Estado</span>
                    <strong>
                        ${p.estado}
                    </strong>
                </div>

                <div class="info">
                    <span>Data</span>
                    <strong>
                        ${new Date(p.criado_em)
                        .toLocaleDateString("pt-BR")}
                    </strong>
                </div>

            </div>

            <div class="desc">
                ${p.descricao || "--"}
            </div>

            <div class="acoes">

                ${
                    p.status != 'VENDIDO'
                    ?
                    `
                    <button class="action sell"
                    onclick="marcarVendido(${p.id}, ${p.lucro})">
                        Marcar Vendido
                    </button>
                    `
                    :
                    ""
                }

                <button class="action edit"
                onclick="editarProduto(${p.id})">
                    Editar
                </button>

                <button class="action delete"
                onclick="deletarProduto(${p.id})">
                    Deletar
                </button>

            </div>

        </div>

        `;

    });

}

/* =========================
   FORMATAR
========================= */

function dinheiro(v){

    return Number(v || 0)
    .toLocaleString("pt-BR",{
        style:"currency",
        currency:"BRL"
    });

}

/* =========================
   MODAL
========================= */

function abrirModal(){

    produtoEditando = null;

    document.getElementById("modal")
    .style.display = "flex";

}

window.onclick = function(e){

    const modal =
    document.getElementById("modal");

    if(e.target == modal){

        modal.style.display = "none";

    }

}

/* =========================
   CADASTRAR
========================= */

async function adicionarProduto(){

    const nome =
    document.getElementById("nome").value;

    const categoria =
    document.getElementById("categoria").value;

    const descricao =
    document.getElementById("descricao").value;

    const comprado =
    Number(document.getElementById("comprado").value);

    const venda =
    Number(document.getElementById("venda").value);

    const estado =
    document.getElementById("estado").value;

    const lucro =
    venda - comprado;

    if(nome == ""){

        alert("Digite o nome!");
        return;

    }

    /* EDITAR */

    if(produtoEditando){

        await client
        .from("produtos")
        .update({
            nome,
            categoria,
            descricao,
            comprado,
            venda,
            lucro,
            estado
        })
        .eq("id", produtoEditando);

    }

    /* NOVO */

    else{

        await client
        .from("produtos")
        .insert([{

            nome,
            categoria,
            descricao,

            comprado,
            venda,
            lucro,

            estado,

            status:"ESTOQUE"

        }]);

    }

    document.getElementById("modal")
    .style.display = "none";

    carregarProdutos();

}

/* =========================
   EDITAR
========================= */

async function editarProduto(id){

    produtoEditando = id;

    const { data } = await client
    .from("produtos")
    .select("*")
    .eq("id", id)
    .single();

    if(!data) return;

    document.getElementById("nome")
    .value = data.nome;

    document.getElementById("categoria")
    .value = data.categoria;

    document.getElementById("descricao")
    .value = data.descricao;

    document.getElementById("comprado")
    .value = data.comprado;

    document.getElementById("venda")
    .value = data.venda;

    document.getElementById("estado")
    .value = data.estado;

    document.getElementById("modal")
    .style.display = "flex";

}

/* =========================
   DELETAR
========================= */

async function deletarProduto(id){

    const confirmar =
    confirm("Deseja deletar?");

    if(!confirmar) return;

    await client
    .from("produtos")
    .delete()
    .eq("id", id);

    carregarProdutos();

}

/* =========================
   MARCAR VENDIDO
========================= */

async function marcarVendido(id, lucro){

    await client
    .from("produtos")
    .update({
        status:"VENDIDO"
    })
    .eq("id", id);

    /* PEGA DADOS DA LOJA */

    const { data } = await client
    .from("loja")
    .select("*")
    .limit(1)
    .single();

    if(data){

        const novoLucro =
        Number(data.lucro_total || 0)
        + Number(lucro);

        const novoSaldo =
        Number(data.saldo || 0)
        + Number(lucro);

        await client
        .from("loja")
        .update({

            lucro_total: novoLucro,
            saldo: novoSaldo

        })
        .eq("id", data.id);

    }

    carregarProdutos();
    carregarLoja();

}

/* =========================
   PESQUISA
========================= */

async function pesquisar(){

    const valor =
    document.getElementById("pesquisa")
    .value.toLowerCase();

    const { data } = await client
    .from("produtos")
    .select("*");

    const filtrado =
    data.filter(p =>

        p.nome
        .toLowerCase()
        .includes(valor)

    );

    renderizarProdutos(filtrado);

}

/* =========================
   OCULTAR SALDO
========================= */

let saldoVisivel = true;

function toggleSaldo(){

    saldoVisivel = !saldoVisivel;

    const saldo =
    document.getElementById("saldo");

    const eye =
    document.getElementById("eye");

    if(saldoVisivel){

        carregarLoja();

        eye.innerHTML = "👁️";

    }else{

        saldo.innerHTML = "••••••";

        eye.innerHTML = "🙈";

    }

}

/* =========================
   INIT
========================= */

window.onload = () => {

    carregarProdutos();
    carregarLoja();

};

</script>