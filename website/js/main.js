const nav = document.getElementById("site-nav");
const toggle = document.querySelector(".nav-toggle");

if (toggle && nav) {
  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "Close" : "Menu";
  };

  toggle.addEventListener("click", () => {
    setOpen(!nav.classList.contains("is-open"));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
}

document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});

const filters = document.querySelectorAll("[data-filter]");
const locationCards = document.querySelectorAll("[data-region]");

filters.forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.dataset.filter;
    filters.forEach((item) => item.classList.toggle("is-active", item === button));
    locationCards.forEach((card) => {
      const match = value === "all" || card.dataset.region === value;
      card.classList.toggle("is-hidden", !match);
    });
  });
});

const form = document.getElementById("appointment-form");
const success = document.getElementById("form-success");

if (form && success) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    form.hidden = true;
    success.classList.add("is-visible");
    success.focus();
  });
}

const fleetForm = document.getElementById("fleet-form");
const fleetSuccess = document.getElementById("fleet-success");

if (fleetForm && fleetSuccess) {
  fleetForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!fleetForm.reportValidity()) return;
    fleetForm.hidden = true;
    fleetSuccess.classList.add("is-visible");
    fleetSuccess.focus();
  });
}
