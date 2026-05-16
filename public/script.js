const client = supabase.createClient(
  "https://sdazaoxspcmyqenselmf.supabase.co",
  "sb_publishable_cWIwZ6SagFpcly9NdcG11A_HW6WbS76"
);


/* =========================
   UI FEEDBACK (TOAST)
========================= */
function toast(msg, type = "error") {
  let el = document.createElement("div");

  el.innerText = msg;
  el.style.position = "fixed";
  el.style.bottom = "20px";
  el.style.left = "50%";
  el.style.transform = "translateX(-50%)";
  el.style.padding = "12px 18px";
  el.style.borderRadius = "12px";
  el.style.color = "white";
  el.style.fontSize = "14px";
  el.style.zIndex = "9999";
  el.style.boxShadow = "0 10px 20px rgba(0,0,0,0.2)";
  el.style.animation = "fadein 0.3s ease";

  if (type === "success") {
    el.style.background = "#22c55e";
  } else if (type === "loading") {
    el.style.background = "#6366f1";
  } else {
    el.style.background = "#ef4444";
  }

  document.body.appendChild(el);

  setTimeout(() => {
    el.remove();
  }, 2500);
}

/* =========================
   LOGIN
========================= */
async function login() {
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const btn = document.querySelector("button");

  // VALIDACÕES
  if (!email || !senha) {
    toast("Preencha email e senha", "error");
    return;
  }

  if (!email.includes("@")) {
    toast("Digite um email válido", "error");
    return;
  }

  // loading
  btn.innerText = "Entrando...";
  btn.disabled = true;

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password: senha
  });

  btn.innerText = "Entrar";
  btn.disabled = false;

  if (error) {
    if (error.message.includes("Invalid login")) {
      toast("Email ou senha incorretos", "error");
    } else {
      toast("Erro: " + error.message, "error");
    }
    return;
  }

  toast("Login realizado com sucesso!", "success");

  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 800);
}