/*
 * Cenas do modo completo ("Discover the desktop"): carrega as capturas (so o
 * modo completo as baixa) e marca cada cena quando ela entra na tela, para a
 * entrada suave do showcase.css. Nada roda em loop.
 */
export function setupShowcase() {
  document.querySelectorAll("img[data-showcase-src]").forEach((image) => {
    if (!image.getAttribute("src")) image.src = image.dataset.showcaseSrc;
  });
  const scenes = [...document.querySelectorAll(".journey-scene")];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let observer = null;
  if (reduce.matches || !("IntersectionObserver" in window)) {
    scenes.forEach((scene) => scene.classList.add("is-seen"));
  } else {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-seen");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    scenes.forEach((scene) => observer.observe(scene));
  }
  return () => {
    if (observer) observer.disconnect();
    scenes.forEach((scene) => scene.classList.remove("is-seen"));
  };
}
