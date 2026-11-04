(() => {
  "use strict";
  const grid = document.querySelector("[data-home-portfolio]");
  if (!grid) return;
  const cfg = window.AUGUSTA_MEDIA_CONFIG || {};
  const status = document.getElementById("home-portfolio-status");
  const categories = {
    photography: "Photography", videography: "Videography",
    "photo-editing": "Photo editing", "video-editing": "Video editing",
    "content-media": "Content & media", events: "Events", general: "Selected work"
  };
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
  async function load() {
    if (!window.supabase || !cfg.supabaseUrl || !cfg.supabaseAnonKey) {
      grid.innerHTML = '<div class="home-portfolio-empty"><p class="eyebrow">THE AUGUSTA PORTFOLIO</p><h3>Our selected work is being prepared.</h3><p>We share projects only after they have been approved for public display.</p><a class="button white" href="contact.html">Discuss your project</a></div>';
      if (status) status.textContent = "Portfolio connection is not configured.";
      return;
    }
    try {
      const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
      const { data, error } = await client.from("gallery_items")
        .select("id,file_name,storage_path,media_type,category,title,description")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      const items = await Promise.all((data || []).map(async item => {
        const { data: signed, error: signedError } = await client.storage.from("augusta-media").createSignedUrl(item.storage_path, 1800);
        return { ...item, url: signedError ? "" : signed?.signedUrl || "" };
      }));
      if (!items.length) {
        grid.innerHTML = '<div class="home-portfolio-empty"><p class="eyebrow">THE AUGUSTA PORTFOLIO</p><h3>Good work deserves a proper showcase.</h3><p>Our portfolio is being built with selected projects. We will publish real work here as it is approved, not fill the page with stock images.</p><a class="button white" href="contact.html">Discuss your project</a></div>';
        if (status) status.textContent = "No public portfolio projects have been published yet.";
        return;
      }
      grid.innerHTML = items.map(item => {
        const title = esc(item.title || item.file_name || "Augusta project");
        const category = esc(categories[item.category] || "Augusta work");
        const media = item.url ? (item.media_type === "video"
          ? '<video src="' + esc(item.url) + '" muted playsinline preload="metadata"></video>'
          : '<img src="' + esc(item.url) + '" alt="' + title + '" loading="lazy" decoding="async">')
          : '<div class="home-portfolio-placeholder">Preview unavailable</div>';
        return '<article class="home-portfolio-card"><a href="gallery.html" aria-label="View ' + title + ' in the Augusta portfolio"><div class="home-portfolio-media">' + media + '<span>View project ↗</span></div><div class="home-portfolio-copy"><small>' + category + '</small><h3>' + title + '</h3><p>' + esc(item.description || "Explore more selected work from Augusta.") + '</p></div></a></article>';
      }).join("");
      if (status) status.textContent = "Showing " + items.length + " selected public project" + (items.length === 1 ? "." : "s.");
    } catch (error) {
      console.error("Augusta homepage portfolio could not load:", error);
      grid.innerHTML = '<div class="home-portfolio-empty"><h3>Our portfolio is temporarily unavailable.</h3><p>Please visit the full gallery or contact Augusta directly.</p><a class="button white" href="gallery.html">Open full portfolio</a></div>';
      if (status) status.textContent = "Portfolio temporarily unavailable.";
    }
  }
  load();
})();
