(() => {
  "use strict";

  const root = document.getElementById("portfolio-grid");
  const filters = document.getElementById("gallery-filters");
  const status = document.getElementById("gallery-status");
  const cfg = window.AUGUSTA_MEDIA_CONFIG || {};
  if (!root || !filters) return;

  const categories = {
    photography: "Photography",
    videography: "Videography",
    "photo-editing": "Photo editing",
    "video-editing": "Video editing",
    "content-media": "Content & media",
    events: "Events",
    "home-cleaning": "Home cleaning",
    laundry: "Laundry & ironing",
    wardrobe: "Wardrobe organisation",
    general: "Portfolio"
  };

  let records = [];
  let active = "all";

  const escapeHtml = value => String(value ?? "").replace(/[&<>"]/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"
  }[char]));

  function updateFilters() {
    filters.querySelectorAll("button[data-filter]").forEach(button => {
      const key = button.dataset.filter;
      const count = key === "all"
        ? records.length
        : records.filter(item => item.category === key).length;
      const label = button.dataset.label || button.textContent.replace(/\s*\(\d+\)$/, "");
      button.dataset.label = label;
      button.textContent = `${label} (${count})`;
      button.setAttribute("aria-pressed", String(active === key));
    });
  }

  function render() {
    const visible = records.filter(item => active === "all" || item.category === active);

    if (!visible.length) {
      root.innerHTML = '<div class="gallery-empty"><span class="gallery-empty-mark" aria-hidden="true">A</span><h3>No projects here just yet</h3><p>We are preparing this part of Augusta’s portfolio. Check back soon or contact us about a project.</p><a class="button" href="contact.html">Discuss a project</a></div>';
    } else {
      root.innerHTML = visible.map(item => {
        const title = escapeHtml(item.title || item.file_name || "Augusta project");
        const category = escapeHtml(categories[item.category] || "Augusta work");
        const description = escapeHtml(item.description || "");
        const media = item.signed_url
          ? item.media_type === "video"
            ? `<div class="portfolio-media portfolio-video"><video controls preload="metadata" playsinline aria-label="${title}" src="${escapeHtml(item.signed_url)}"></video></div>`
            : `<div class="portfolio-media"><img src="${escapeHtml(item.signed_url)}" alt="${title}" loading="lazy" decoding="async"></div>`
          : '<div class="portfolio-media media-unavailable"><span>Preview unavailable</span></div>';

        return `<article class="portfolio-card">
          ${media}
          <div class="portfolio-copy">
            <p class="portfolio-type">${category}</p>
            <h3>${title}</h3>
            ${description ? `<p class="portfolio-description">${description}</p>` : ""}
          </div>
        </article>`;
      }).join("");
    }

    updateFilters();
    if (status) {
      status.textContent = records.length
        ? `Showing ${visible.length} of ${records.length} approved project${records.length === 1 ? "" : "s"}.`
        : "Only projects approved for public display appear here.";
    }
  }

  filters.addEventListener("click", event => {
    const button = event.target.closest("button[data-filter]");
    if (!button) return;
    active = button.dataset.filter;
    render();
  });

  async function init() {
    if (!window.supabase || !cfg.supabaseUrl || !cfg.supabaseAnonKey ||
        cfg.supabaseUrl.startsWith("ADD_") || cfg.supabaseAnonKey.startsWith("ADD_")) {
      root.innerHTML = '<div class="gallery-empty"><h3>Our portfolio is being prepared</h3><p>Please check back soon.</p></div>';
      if (status) status.textContent = "Gallery connection is not configured.";
      return;
    }

    try {
      const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
      const { data, error } = await client
        .from("gallery_items")
        .select("id,file_name,storage_path,media_type,category,title,description,created_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      records = await Promise.all((data || []).map(async item => {
        const { data: signed, error: mediaError } = await client.storage
          .from("augusta-media")
          .createSignedUrl(item.storage_path, 3600);
        return { ...item, signed_url: mediaError ? "" : (signed?.signedUrl || "") };
      }));

      render();
    } catch (error) {
      console.error("Augusta gallery could not load:", error);
      root.innerHTML = '<div class="gallery-empty"><h3>We could not load the portfolio</h3><p>Please try again in a moment. If the problem continues, contact Augusta directly.</p><button class="button gallery-retry" type="button">Try again</button></div>';
      root.querySelector(".gallery-retry")?.addEventListener("click", () => {
        root.innerHTML = '<p class="gallery-loading">Loading approved portfolio work…</p>';
        if (status) status.textContent = "Reconnecting to the portfolio…";
        init();
      });
      if (status) status.textContent = "Portfolio temporarily unavailable.";
    }
  }

  init();
})();