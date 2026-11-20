/*
 * Tema das paginas do ccore: segue o sistema ate a pessoa escolher outro no
 * botao do canto (#themeToggle). A escolha fica no localStorage. Carregar no
 * <head>, sem defer, antes do CSS: assim o data-theme entra antes da primeira
 * pintura e a pagina nao pisca. O rotulo segue o idioma da pagina.
 */
(function () {
  var KEY = "ccoreTheme";
  var root = document.documentElement;
  var LABELS = {
    pt: { system: "Tema: sistema", light: "Tema: claro", dark: "Tema: escuro", change: "Trocar tema" },
    en: { system: "Theme: system", light: "Theme: light", dark: "Theme: dark", change: "Change theme" }
  };
  var NEXT = { system: "light", light: "dark", dark: "system" };

  function read() {
    try {
      var value = localStorage.getItem(KEY);
      return NEXT[value] ? value : "system";
    } catch (e) {
      return "system";
    }
  }

  function apply(choice) {
    if (choice === "light" || choice === "dark") {
      root.setAttribute("data-theme", choice);
    } else {
      root.removeAttribute("data-theme");
    }
  }

  apply(read());

  document.addEventListener("DOMContentLoaded", function () {
    var button = document.getElementById("themeToggle");
    if (!button) {
      return;
    }
    var current = read();

    function render() {
      var words = LABELS[(root.lang || "en").slice(0, 2) === "pt" ? "pt" : "en"];
      button.textContent = words[current];
      button.setAttribute("aria-label", words[current] + ". " + words.change);
    }

    render();
    document.addEventListener("i18n:change", render);
    // Outra pagina do ccore aberta (ou o documento embutido nos termos)
    // trocou o tema: acompanha sem recarregar.
    window.addEventListener("storage", function (event) {
      if (event.key === KEY) {
        current = read();
        apply(current);
        render();
      }
    });
    button.addEventListener("click", function () {
      current = NEXT[current];
      try {
        localStorage.setItem(KEY, current);
      } catch (e) {
        // Sem storage o tema ainda troca, so nao e lembrado.
      }
      apply(current);
      render();
    });
  });
})();
