/*
 * Tema do painel: segue o sistema (claro = livro de ordens, escuro = casaca
 * escarlate) ate a pessoa escolher outro no botao do canto. A escolha fica no
 * localStorage. Carregado no <head>, antes do CSS, para nao piscar.
 */
(function () {
  var KEY = "dashboardTheme";
  var root = document.documentElement;
  var LABELS = { system: "Tema: sistema", light: "Tema: claro", dark: "Tema: escuro" };
  var NEXT = { system: "light", light: "dark", dark: "system" };

  function read() {
    try {
      var value = localStorage.getItem(KEY);
      return LABELS[value] ? value : "system";
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
      button.textContent = LABELS[current];
      button.setAttribute("aria-label", LABELS[current] + ". Trocar tema");
    }

    render();
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
