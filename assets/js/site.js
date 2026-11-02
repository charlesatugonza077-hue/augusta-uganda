(() => {
  const cfg = window.AUGUSTA_CONFIG || {};
  const number = cfg.whatsappNumber || "256741102053";
  const whatsapp = message => `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  document.querySelectorAll('[data-wa-service]').forEach(el => {
    const service = el.dataset.waService;
    const detail = el.dataset.waDetail || '';
    el.href = whatsapp(`Hello Augusta, I would like to enquire about ${service}.${detail ? ` ${detail}` : ''}`);
    el.target = '_blank'; el.rel = 'noopener';
  });
  document.querySelectorAll('[data-wa-general]').forEach(el => {
    el.href = whatsapp('Hello Augusta, I would like to know more about your services.');
    el.target = '_blank'; el.rel = 'noopener';
  });
  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-mobile-menu]');
  if (toggle && panel) {
    toggle.addEventListener('click', () => {
      const open = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      toggle.textContent = open ? '×' : '☰';
    });
    panel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { panel.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); toggle.textContent='☰'; }));
  }
  const form = document.querySelector('[data-enquiry-form]');
  if (!form) return;
  const status = form.querySelector('[data-form-status]');
  const service = form.querySelector('[name=service]');
  const selected = new URLSearchParams(location.search).get('service');
  if (selected && service) service.value = selected;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    const button = form.querySelector('button[type=submit]');
    button.disabled = true;
    status.textContent = 'Opening WhatsApp with your enquiry…';
    if (cfg.enquiryEndpoint) {
      try { await fetch(cfg.enquiryEndpoint, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,source:'augusta-website'})}); } catch (_) { /* WhatsApp remains available if the form endpoint is unavailable. */ }
    }
    const message = `Hello Augusta, my name is ${data.name}. I need ${data.service}. Location: ${data.location}. Preferred timing: ${data.timing}. Details: ${data.message || 'None yet'}.`;
    window.open(whatsapp(message), '_blank', 'noopener');
    button.disabled = false;
  });
})();