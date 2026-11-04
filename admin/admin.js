(() => {
  "use strict";

  const cfg = window.AUGUSTA_MEDIA_CONFIG || {};
  const $ = id => document.getElementById(id);
  const requiredIds = [
    "login-message", "login-form", "login-panel", "manager", "logout",
    "upload-form", "media-files", "category", "title", "description",
    "publish-now", "upload-button", "upload-message", "media-list",
    "total-count", "published-count", "draft-count", "filter"
  ];
  if (requiredIds.some(id => !$(id))) {
    console.error("Augusta Media Manager: required interface element is missing.");
    return;
  }

  const configured = cfg.supabaseUrl && cfg.supabaseAnonKey &&
    !cfg.supabaseUrl.startsWith("ADD_") &&
    !cfg.supabaseAnonKey.startsWith("ADD_") &&
    window.supabase;
  if (!configured) {
    $("login-message").textContent = "The secure media service is not connected. Please contact the system administrator.";
    return;
  }

  const db = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  const bucket = "augusta-media";
  const maxFileSize = 50 * 1024 * 1024;
  const categories = {
    photography: "Photography",
    videography: "Videography",
    "photo-editing": "Photo editing",
    "video-editing": "Video editing",
    "content-media": "Content & media",
    "home-cleaning": "Home cleaning & organisation",
    laundry: "Laundry & ironing",
    wardrobe: "Wardrobe organisation",
    events: "Events",
    general: "General portfolio"
  };
  const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];
  let items = [];
  let currentUser = null;
  let busy = false;

  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
  const setMessage = (id, message, isError = false) => {
    $(id).textContent = message;
    $(id).classList.toggle("error", isError);
  };
  const setBusy = (button, state, label) => {
    button.disabled = state;
    if (label) button.textContent = state ? label : button.dataset.originalLabel || button.textContent;
  };
  const fileExtension = name => {
    const match = String(name).toLowerCase().match(/\.([a-z0-9]{1,8})$/);
    return match ? match[1] : "bin";
  };

  async function showSession(session) {
    currentUser = session?.user || null;
    const signedIn = !!currentUser;
    $("login-panel").classList.toggle("hidden", signedIn);
    $("manager").classList.toggle("hidden", !signedIn);
    $("logout").classList.toggle("hidden", !signedIn);
    if (signedIn) await loadMedia();
    else {
      items = [];
      updateStats();
      $("media-list").innerHTML = '<p class="empty">Sign in to view the private media library.</p>';
    }
  }

  async function loadMedia() {
    $("media-list").innerHTML = '<p class="empty">Loading media…</p>';
    const { data, error } = await db
      .from("gallery_items")
      .select("id,file_name,storage_path,media_type,category,title,description,is_published,created_at")
      .order("created_at", { ascending: false });
    if (error) {
      setMessage("upload-message", "Could not load the library. Confirm that this account is an approved Augusta administrator.", true);
      $("media-list").innerHTML = '<p class="empty">Media library unavailable. Check administrator access and try again.</p>';
      return;
    }

    items = await Promise.all((data || []).map(async item => {
      const { data: signed, error: signedError } = await db.storage
        .from(bucket).createSignedUrl(item.storage_path, 1800);
      return { ...item, signed_url: signedError ? "" : (signed?.signedUrl || "") };
    }));
    updateStats();
    renderMedia();
  }

  function updateStats() {
    $("total-count").textContent = String(items.length);
    $("published-count").textContent = String(items.filter(item => item.is_published).length);
    $("draft-count").textContent = String(items.filter(item => !item.is_published).length);
  }

  function mediaPreview(item) {
    if (!item.signed_url) return '<div class="media-placeholder">Preview unavailable</div>';
    const url = escapeHtml(item.signed_url);
    return item.media_type === "video"
      ? `<video src="${url}" muted playsinline preload="metadata"></video>`
      : `<img src="${url}" alt="" loading="lazy">`;
  }

  function renderMedia() {
    const filter = $("filter").value;
    const visible = items.filter(item =>
      filter === "all" || (filter === "published" ? item.is_published : !item.is_published)
    );
    if (!visible.length) {
      $("media-list").innerHTML = '<p class="empty">No media items in this view yet. Upload your first approved project.</p>';
      return;
    }
    $("media-list").innerHTML = visible.map(item => {
      const id = escapeHtml(item.id);
      const title = escapeHtml(item.title || item.file_name);
      const category = escapeHtml(categories[item.category] || item.category);
      const status = item.is_published ? "Published" : "Draft";
      return `<article class="media-item" data-item-id="${id}">
        ${mediaPreview(item)}
        <div class="media-info">
          <strong>${title}</strong>
          <div class="meta">${category} · ${escapeHtml(item.media_type)} · ${status}</div>
          ${item.description ? `<p class="meta">${escapeHtml(item.description)}</p>` : ""}
          <div class="actions">
            <button type="button" data-action="edit" data-id="${id}">Edit details</button>
            <button type="button" data-action="toggle" data-id="${id}">${item.is_published ? "Unpublish" : "Publish"}</button>
            <button type="button" class="danger" data-action="delete" data-id="${id}">Delete</button>
          </div>
        </div>
      </article>`;
    }).join("");
  }

  async function uploadFiles(event) {
    event.preventDefault();
    if (!currentUser || busy) return;
    const files = Array.from($("media-files").files || []);
    if (!files.length) return;
    const invalid = files.find(file => {
      const validType = allowedImageTypes.includes(file.type) || allowedVideoTypes.includes(file.type);
      return !validType || file.size > maxFileSize || file.size === 0;
    });
    if (invalid) {
      setMessage("upload-message", `“${invalid.name}” is empty, over 50 MB, or has an unsupported format. Use JPG, PNG, WebP, AVIF, MP4, WebM or MOV.`, true);
      return;
    }

    busy = true;
    const button = $("upload-button");
    button.disabled = true;
    const category = $("category").value;
    const description = $("description").value.trim();
    const title = $("title").value.trim();
    const publish = $("publish-now").checked;
    let completed = 0;
    const failures = [];

    try {
      for (const file of files) {
        const mediaType = allowedVideoTypes.includes(file.type) ? "video" : "image";
        const safeBase = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(-100) || "media";
        const path = `${currentUser.id}/${Date.now()}-${crypto.randomUUID()}-${safeBase}`;
        const { error: storageError } = await db.storage.from(bucket).upload(path, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false
        });
        if (storageError) {
          failures.push(`${file.name}: ${storageError.message}`);
          continue;
        }

        const { error: insertError } = await db.from("gallery_items").insert({
          file_name: file.name,
          storage_path: path,
          media_type: mediaType,
          category,
          title: title || file.name.replace(/\.[^.]+$/, ""),
          description: description || null,
          is_published: publish
        });
        if (insertError) {
          await db.storage.from(bucket).remove([path]);
          failures.push(`${file.name}: ${insertError.message}`);
          continue;
        }
        completed += 1;
      }
      $("upload-form").reset();
      await loadMedia();
      if (failures.length) {
        setMessage("upload-message", `${completed} file(s) uploaded. ${failures.join(" | ")}`, true);
      } else {
        setMessage("upload-message", `${completed} file(s) uploaded successfully as ${publish ? "published items" : "drafts"}.`);
      }
    } finally {
      busy = false;
      button.disabled = false;
    }
  }

  async function handleMediaAction(event) {
    const button = event.target.closest("button[data-action]");
    if (!button || !currentUser || busy) return;
    const item = items.find(entry => entry.id === button.dataset.id);
    if (!item) return;
    const action = button.dataset.action;

    if (action === "edit") {
      const nextTitle = window.prompt("Media title:", item.title || item.file_name);
      if (nextTitle === null) return;
      const nextDescription = window.prompt("Short description:", item.description || "");
      if (nextDescription === null) return;
      const { error } = await db.from("gallery_items").update({
        title: nextTitle.trim().slice(0, 120) || item.file_name,
        description: nextDescription.trim().slice(0, 500) || null
      }).eq("id", item.id);
      if (error) {
        setMessage("upload-message", `Could not update item: ${error.message}`, true);
        return;
      }
    } else if (action === "toggle") {
      const nextState = !item.is_published;
      const confirmText = nextState
        ? "Publish this item to the public gallery?"
        : "Remove this item from the public gallery? It will remain saved as a draft.";
      if (!window.confirm(confirmText)) return;
      const { error } = await db.from("gallery_items")
        .update({ is_published: nextState }).eq("id", item.id);
      if (error) {
        setMessage("upload-message", `Could not change publication status: ${error.message}`, true);
        return;
      }
    } else if (action === "delete") {
      if (!window.confirm("Permanently delete this media item and its stored file? This cannot be undone.")) return;
      const { error: rowError } = await db.from("gallery_items").delete().eq("id", item.id);
      if (rowError) {
        setMessage("upload-message", `Could not delete the media record: ${rowError.message}`, true);
        return;
      }
      const { error: storageError } = await db.storage.from(bucket).remove([item.storage_path]);
      if (storageError) {
        setMessage("upload-message", `The gallery record was removed, but the stored file could not be deleted: ${storageError.message}`, true);
        await loadMedia();
        return;
      }
    }
    await loadMedia();
  }

  $("login-form").addEventListener("submit", async event => {
    event.preventDefault();
    if (busy) return;
    const button = $("login-form").querySelector('button[type="submit"]');
    const email = $("email").value.trim();
    const password = $("password").value;
    button.disabled = true;
    setMessage("login-message", "Signing in…");
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    button.disabled = false;
    if (error) {
      setMessage("login-message", "Sign-in failed. Check your email and password, then try again.", true);
      console.warn("Augusta sign-in failed:", error.message);
      return;
    }
    $("password").value = "";
    setMessage("login-message", "");
    await showSession(data.session);
  });

  $("logout").addEventListener("click", async () => {
    $("logout").disabled = true;
    const { error } = await db.auth.signOut();
    $("logout").disabled = false;
    if (error) setMessage("upload-message", "Could not sign out. Please try again.", true);
    else await showSession(null);
  });

  $("upload-form").addEventListener("submit", uploadFiles);
  $("filter").addEventListener("change", renderMedia);
  $("media-list").addEventListener("click", handleMediaAction);

  db.auth.onAuthStateChange((_event, session) => {
    window.setTimeout(() => showSession(session), 0);
  });
  db.auth.getSession().then(({ data, error }) => {
    if (error) setMessage("login-message", "Could not check your sign-in session. Refresh and try again.", true);
    else showSession(data.session);
  });
})();
