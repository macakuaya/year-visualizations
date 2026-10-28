import { allRenderers } from "./renderers.js";

const gallery = document.getElementById("gallery");
const yearSelect = document.getElementById("year-select");
const yearLabel = document.getElementById("year-label");
const shareBtn = document.getElementById("share-btn");

shareBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    shareBtn.textContent = "Copied!";
  } catch {
    shareBtn.textContent = window.location.href;
  }
  setTimeout(() => {
    shareBtn.textContent = "Copy share link";
  }, 2000);
});

const currentYear = new Date().getFullYear();
for (let y = currentYear; y >= currentYear - 4; y--) {
  const opt = document.createElement("option");
  opt.value = String(y);
  opt.textContent = String(y);
  yearSelect.appendChild(opt);
}

function render(year) {
  yearLabel.textContent = String(year);
  gallery.replaceChildren();
  for (const fn of allRenderers) {
    gallery.appendChild(fn(year));
  }
}

yearSelect.addEventListener("change", () => {
  render(Number(yearSelect.value));
});

render(currentYear);
