(() => {
  "use strict";
  const root = document.getElementById("portfolio-grid");
  const filters = document.getElementById("gallery-filters");
  const status = document.getElementById("gallery-status");
  const cfg = window.AUGUSTA_MEDIA_CONFIG || {};
  const categories = {
    photography:"Photography", videography:"Videography",
    "photo-editing":"Photo editing", "video-editing":"Video editing",
    "content-media":"Content & media", events:"Events",
    "home-cleaning":"Home cleaning", laundry:"Laundry & ironing",
    wardrobe:"Wardrobe organisation", general:"Portfolio"
  };
  let records = [];
  let active = "all";
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[ch]);
  function render() {
    const visible = records.filter(item => active === "all" || item.category === active);
    root.innerHTML = visible.length ? visible.map(item => {
      const title = escapeHtml(item.title || item.file_name || "Augusta project");
      const category = escapeHtml(categories[item.category] || "Augusta work");
      const description = escapeHtml(item.description || "");
      const media = item.media_type === "video"
        ? '<video controls preload="metadata" playsinline aria-label="' + title + '"><source src="' + escapeHtml(item.public_url) + '"></video>'
        : '<img loading="lazy" src="' + escapeHtml(item.public_url) + '" alt="' + title + '">';
      return '<article class="portfolio-item"><div class="portfolio-media">' + media +
        '</div><div class="portfolio-copy"><p class="eyebrow">' + category +
        '</p><h3>' + title + '</h3>' + (description ? '<p>' + description + '</p>' : '') +
        '</div></article>';
    }).join("") : '<p class="gallery-empty">No published projects in this category yet. Please check back as our portfolio grows.</p>';
    if (status) status.textContent = records.length
      ? "Showing " + visible.length + " approved project(s)."
      : "Our portfolio is being prepared. Only approved work will appear here.";
  }
  filters?.addEventListener("click", event => {
    const button = event.target.closest("button[data-filter]");
    if (!button) return;
    active = button.dataset.filter;
    filters.querySelectorAll("button[data-filter]").forEach(item =>
      item.setAttribute("aria-pressed", String(item === button)));
    render();
  });
  async function init() {
    if (!window.supabase || !cfg.supabaseUrl || !cfg.supabaseAnonKey ||
        cfg.supabaseUrl.startsWith("ADD_") || cfg.supabaseAnonKey.startsWith("ADD_")) {
      root.innerHTML = '<p class="gallery-empty">The portfolio is being prepared. Please check back soon.</p>';
      if (status) status.textContent = "Gallery connection is not yet configured.";
      return;
    }
    try {
      const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
      const { data, error } = await client.from("gallery_items")
        .select("id,file_name,public_url,media_type,category,title,description,created_at")
        .eq("is_published", true).order("created_at", { ascending: false });
      if (error) throw error;
      records = data || [];
      render();
    } catch (error) {
      root.innerHTML = '<p class="gallery-empty">We could not load the portfolio right now. Please try again later.</p>';
      if (status) status.textContent = "Portfolio temporarily unavailable.";
    }
  }
  init();
})();