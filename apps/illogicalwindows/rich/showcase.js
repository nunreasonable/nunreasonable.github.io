/* Une a rolagem as cenas, sem loop quando a pagina esta parada. */
export function setupShowcase() {
  document.querySelectorAll("img[data-showcase-src]").forEach((image) => { image.src = image.dataset.showcaseSrc; });
  const hero = document.getElementById("top");
  const stage = hero.querySelector(".launch-stage");
  const journey = document.getElementById("journey");
  const scenes = [...journey.querySelectorAll(".journey-scene")];
  const marks = [...journey.querySelectorAll(".journey-progress i")];
  const motion = matchMedia("(min-width: 901px) and (prefers-reduced-motion: no-preference)");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const visible = new Set();
  const counter = journey.querySelector(".journey-counter");
  const styles = new WeakMap();
  let frame = 0;
  let previous = -1;
  const clamp = (n) => Math.max(0, Math.min(1, n));

  function setStyle(element, name, value) {
    let cache = styles.get(element);
    if (!cache) { cache = new Map(); styles.set(element, cache); }
    if (cache.get(name) === value) return;
    cache.set(name, value);
    element.style.setProperty(name, value);
  }
  function resetScenes() {
    scenes.forEach((scene) => {
      scene.style.removeProperty("--scene-alpha");
      scene.style.removeProperty("--scene-y");
      styles.delete(scene);
    });
  }
  function update(now) {
    frame = 0;
    if (document.hidden) return;
    // Mede tudo antes de escrever estilos, evitando recalculo entre leituras.
    const bounds = visible.has(hero) && !reduce.matches ? hero.getBoundingClientRect() : null;
    const r = motion.matches && visible.has(journey) ? journey.getBoundingClientRect() : null;
    if (bounds) {
      const progress = clamp(-bounds.top / Math.max(1, bounds.height * .6));
      setStyle(stage, "--launch-tilt", `${(9 * (1 - progress)).toFixed(2)}deg`);
      setStyle(stage, "--launch-turn", `${(-3 * (1 - progress)).toFixed(2)}deg`);
      setStyle(stage, "--launch-scale", (.94 + progress * .06).toFixed(4));
      setStyle(stage, "--search-y", `${(28 - progress * 65).toFixed(2)}px`);
      setStyle(stage, "--side-y", `${(-18 + progress * 50).toFixed(2)}px`);
    }
    if (!r) return;
    const progress = clamp((56 - r.top) / Math.max(1, r.height - innerHeight + 56));
    const position = progress * scenes.length;
    const current = Math.min(scenes.length - 1, Math.floor(position + .1));
    scenes.forEach((scene, i) => {
      const distance = position - i;
      const alpha = clamp((distance + .2) / .2) * clamp((1 - distance) / .22);
      // A ultima cena fica ate o fim, em vez de apagar na saida da secao.
      setStyle(scene, "--scene-alpha", (i === scenes.length - 1 && distance >= 0 ? 1 : clamp(alpha)).toFixed(3));
      setStyle(scene, "--scene-y", `${((1 - clamp((distance + .2) / .45)) * 65 - clamp((distance - .7) / .3) * 35).toFixed(2)}px`);
      if (current !== previous) {
        scene.classList.toggle("is-current", i === current);
      }
    });
    if (current !== previous) {
      marks.forEach((mark, i) => mark.classList.toggle("is-on", i <= current));
      counter.textContent = `0${current + 1} / 03`;
      previous = current;
    }
  }
  // Um quadro por quadro de tela, sem teto: o update custa ~0,14 ms, e um
  // teto de 60 fps fazia a cena andar em degraus num monitor de 200 Hz.
  function request() {
    if (frame || document.hidden || !visible.size) return;
    frame = requestAnimationFrame(update);
  }
  // As cenas ficam empilhadas e so a atual aparece. Em vez de esconde-las do
  // teclado (inert), o foco que entra numa cena rola a pagina ate ela.
  function focusScene(event) {
    if (!motion.matches) return;
    const i = scenes.findIndex((scene) => scene.contains(event.target));
    if (i < 0 || i === previous) return;
    const r = journey.getBoundingClientRect();
    const span = Math.max(1, r.height - innerHeight + 56);
    const top = scrollY + r.top - 56 + ((i + .5) / scenes.length) * span;
    scrollTo({top, behavior: "instant"});
  }
  function changeMode() {
    document.documentElement.classList.toggle("showcase-motion", motion.matches);
    previous = -1;
    resetScenes();
    scenes.forEach((scene, i) => {
      scene.classList.toggle("is-current", i === 0);
    });
    request();
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
    request();
  });
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-seen"); revealObserver.unobserve(entry.target); }
    });
  }, {threshold: .12});
  scenes.forEach((scene) => revealObserver.observe(scene));
  observer.observe(hero);
  observer.observe(journey);
  window.addEventListener("scroll", request, {passive: true});
  journey.addEventListener("focusin", focusScene);
  window.addEventListener("resize", request);
  document.addEventListener("visibilitychange", request);
  motion.addEventListener("change", changeMode);
  reduce.addEventListener("change", request);
  changeMode();
  return () => {
    observer.disconnect();
    revealObserver.disconnect();
    scenes.forEach((scene) => scene.classList.remove("is-seen"));
    cancelAnimationFrame(frame);
    journey.removeEventListener("focusin", focusScene);
    window.removeEventListener("scroll", request);
    window.removeEventListener("resize", request);
    document.removeEventListener("visibilitychange", request);
    motion.removeEventListener("change", changeMode);
    reduce.removeEventListener("change", request);
    document.documentElement.classList.remove("showcase-motion");
    resetScenes();
    ["--launch-tilt", "--launch-turn", "--launch-scale", "--search-y", "--side-y"].forEach((name) => stage.style.removeProperty(name));
  };
}
