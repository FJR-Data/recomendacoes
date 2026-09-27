(() => {
  const busca = document.getElementById("busca");
  const chips = [...document.querySelectorAll(".chip")];
  const cards = [...document.querySelectorAll(".card[data-busca]")];
  const vazio = document.getElementById("sem-resultado");
  const normalizar = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const indice = new Map(cards.map((c) => [c, normalizar(c.dataset.busca)]));
  let categoria = "";

  const el = (tag, classe, texto) => {
    const n = document.createElement(tag);
    n.className = classe;
    if (texto) n.textContent = texto;
    return n;
  };

  // Estado vazio: montado com textContent (o termo digitado nunca vira HTML).
  const mostrarVazio = (termo) => {
    if (!vazio) return;
    vazio.textContent = "";
    if (termo === null) return;
    const caixa = el("div", "vazio-filtro");
    const lupa = document.querySelector(".busca .ic");
    if (lupa) caixa.append(lupa.cloneNode(true));
    const limpar = el("button", "limpar", "Limpar filtros");
    limpar.type = "button";
    limpar.addEventListener("click", () => {
      if (busca) busca.value = "";
      selecionar(chips[0]);
      busca?.focus();
    });
    caixa.append(
      el("p", "vazio-filtro__titulo", termo ? `Nada encontrado para “${termo}”` : "Nada encontrado nesta categoria"),
      el("p", "vazio-filtro__dica", "Tente outra palavra ou veja todas as categorias."),
      limpar,
    );
    vazio.append(caixa);
  };

  const filtrar = () => {
    const bruto = (busca?.value || "").trim();
    const termos = normalizar(bruto).split(/\s+/).filter(Boolean);
    let visiveis = 0;
    for (const c of cards) {
      const ok = (!categoria || c.dataset.categoria === categoria) &&
        termos.every((t) => indice.get(c).includes(t));
      c.hidden = !ok;
      if (ok) visiveis++;
    }
    mostrarVazio(visiveis ? null : bruto);
  };

  const selecionar = (chip) => {
    if (!chip) return;
    categoria = chip.dataset.categoria;
    for (const x of chips) {
      x.classList.toggle("ativo", x === chip);
      x.setAttribute("aria-pressed", String(x === chip));
    }
    centralizar(chip);
    filtrar();
  };

  // No celular a fileira de chips rola: traz o escolhido para o meio, fora da borda esmaecida.
  const centralizar = (chip) => {
    const fileira = chip.parentElement;
    if (!fileira || fileira.scrollWidth <= fileira.clientWidth) return;
    const f = fileira.getBoundingClientRect();
    const c = chip.getBoundingClientRect();
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    fileira.scrollTo({
      left: fileira.scrollLeft + c.left - f.left - (f.width - c.width) / 2,
      behavior: reduzir ? "auto" : "smooth",
    });
  };

  busca?.addEventListener("input", filtrar);
  for (const chip of chips) chip.addEventListener("click", () => selecionar(chip));

  document.addEventListener("click", async (ev) => {
    const btn = ev.target.closest(".copiar");
    if (!btn) return;
    const rotulo = btn.querySelector("span") || btn;
    if (!btn.dataset.rotulo) btn.dataset.rotulo = rotulo.textContent;
    try {
      await navigator.clipboard.writeText(btn.dataset.url);
    } catch {
      window.prompt("Copie o link:", btn.dataset.url);
      return;
    }
    rotulo.textContent = "Link copiado";
    btn.classList.add("copiado");
    clearTimeout(btn.timer);
    btn.timer = setTimeout(() => {
      rotulo.textContent = btn.dataset.rotulo;
      btn.classList.remove("copiado");
    }, 2000);
  });
})();
