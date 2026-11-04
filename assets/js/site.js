(() => {
  const config = window.AUGUSTA_CONFIG || {};
  const number = String(config.whatsappNumber || "").replace(/\D/g, "");
  const whatsappUrl = message => number ? "https://wa.me/" + number + "?text=" + encodeURIComponent(message) : "";
  const setWhatsAppLink = (element, message) => {
    const url = whatsappUrl(message);
    if (!url) {
      element.removeAttribute("href");
      element.setAttribute("aria-disabled", "true");
      element.title = "WhatsApp contact is temporarily unavailable.";
      return;
    }
    element.href = url;
    element.target = "_blank";
    element.rel = "noopener noreferrer";
  };
  document.querySelectorAll("[data-wa-service]").forEach(element => {
    const service = element.dataset.waService;
    const detail = element.dataset.waDetail || "";
    setWhatsAppLink(element, "Hello Augusta, I would like to enquire about " + service + "." + (detail ? " " + detail : ""));
  });
  document.querySelectorAll("[data-wa-general]").forEach(element => setWhatsAppLink(element, "Hello Augusta, I would like to know more about your services."));
  const toggle = document.querySelector("[data-menu-toggle]");
  const panel = document.querySelector("[data-mobile-menu]");
  if (toggle && panel) {
    toggle.addEventListener("click", () => {
      const open = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      toggle.textContent = open ? "×" : "☰";
    });
    panel.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      panel.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      toggle.textContent = "☰";
    }));
  }
  const form = document.querySelector("[data-enquiry-form]");
  if (!form) return;
  const status = form.querySelector("[data-form-status]");
  const fallback = form.querySelector("[data-wa-fallback]");
  const service = form.querySelector("[name=service]");
  const selected = new URLSearchParams(window.location.search).get("service");
  if (selected && service) service.value = selected;
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    const message = [
      "Hello Augusta, my name is " + data.name + ".",
      "I need: " + data.service + ".",
      "Location: " + data.location + ".",
      data.contact ? "Preferred contact: " + data.contact + "." : "",
      "Preferred date or timing: " + data.timing + ".",
      "Details: " + (data.message || "I would like to discuss the details.")
    ].join("\n");
    const url = whatsappUrl(message);
    if (!url) {
      status.textContent = "WhatsApp contact is not configured. Please use the contact details published by Augusta.";
      if (fallback) fallback.hidden = true;
      return;
    }
    if (fallback) {
      fallback.href = url;
      fallback.hidden = false;
    }
    status.textContent = "Your enquiry is ready. WhatsApp should open in a new tab. If it does not, use the link below, review the message and press Send in WhatsApp.";
    window.open(url, "_blank", "noopener,noreferrer");
  });
})();
