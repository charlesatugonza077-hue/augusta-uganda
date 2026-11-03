/* Public settings only. No paid endpoint or private credentials are required. */
window.AUGUSTA_CONFIG = Object.freeze({ whatsappNumber: "256741102053" });

(() => {
  const addLink = (parent, label, href, className, marker) => {
    if (!parent || parent.querySelector(`[${marker}]`)) return;
    const link = document.createElement("a");
    link.textContent = label;
    link.href = href;
    if (className) link.className = className;
    link.setAttribute(marker, "");
    parent.append(link);
  };
  const addPolicyNavigation = () => {
    const path = window.location.pathname;
    const inServiceFolder = path.includes("/services/");
    const root = inServiceFolder ? "../" : "";
    const policyHref = root + "client-policies.html";
    document.querySelectorAll(".desktop-nav").forEach(nav => addLink(nav, "Policies", policyHref, "nav-link", "data-policy-link"));
    document.querySelectorAll("[data-mobile-menu]").forEach(menu => addLink(menu, "Client policies", policyHref, "", "data-policy-link"));
    document.querySelectorAll(".footer-grid").forEach(grid => {
      if (grid.querySelector('a[href$="client-policies.html"]')) return;
      const column = document.createElement("div");
      const heading = document.createElement("h4");
      heading.textContent = "Client policies";
      column.append(heading);
      [["Policy centre","client-policies.html"],["Terms of service","terms-of-service.html"],["Booking & payments","booking-policy.html"],["Privacy","privacy.html"],["Legal information","legal.html"]].forEach(([label, href]) => {
        const link = document.createElement("a");
        link.textContent = label;
        link.href = root + href;
        column.append(link);
      });
      grid.append(column);
    });
    if ((inServiceFolder || path.endsWith("/home-services.html")) && !document.querySelector("[data-before-book]")) {
      const section = document.createElement("section");
      section.className = "section";
      section.dataset.beforeBook = "";
      const wrap = document.createElement("div");
      wrap.className = "wrap";
      const card = document.createElement("div");
      card.className = "side-card";
      const eyebrow = document.createElement("p");
      eyebrow.className = "eyebrow";
      eyebrow.textContent = "Before you book";
      const heading = document.createElement("h2");
      heading.textContent = "Let’s confirm the important details first.";
      const copy = document.createElement("p");
      copy.textContent = "Augusta will confirm the service scope, date, location, price or pricing basis, payment timing and key exclusions in writing before a booking is confirmed.";
      const link = document.createElement("a");
      link.className = "button";
      link.href = policyHref;
      link.textContent = "Read client policies";
      card.append(eyebrow, heading, copy, link);
      wrap.append(card);
      section.append(wrap);
      const target = document.querySelector(".service-hero") || document.querySelector("main");
      if (target) target.insertAdjacentElement("afterend", section);
    }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addPolicyNavigation, { once: true });
  else addPolicyNavigation();
})();
