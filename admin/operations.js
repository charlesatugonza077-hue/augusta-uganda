(() => {
  "use strict";
  const cfg = window.AUGUSTA_MEDIA_CONFIG || {};
  const root = document.getElementById("manager");
  if (!root || !window.supabase || !cfg.supabaseUrl || !cfg.supabaseAnonKey) return;
  const db = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  const $ = id => document.getElementById(id);
  const state = { customers: [], enquiries: [], projects: [], tasks: [], ready: false, loading: false };
  const statusLabels = {
    new: "New", contacted: "Contacted", qualified: "Qualified", converted: "Converted", closed: "Closed",
    planned: "Planned", active: "Active", "on-hold": "On hold", completed: "Completed", cancelled: "Cancelled",
    todo: "To do", "in-progress": "In progress", done: "Done"
  };
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
  const empty = message => '<p class="empty">' + esc(message) + '</p>';
  const dateLabel = value => value ? new Date(value + (String(value).length === 10 ? "T12:00:00" : "")).toLocaleDateString("en-UG", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const money = (value, currency) => value == null ? "Not quoted" : new Intl.NumberFormat("en-UG", { style: "currency", currency: currency || "UGX", maximumFractionDigits: 0 }).format(Number(value));
  const feedback = (id, message, error = false) => {
    const node = $(id);
    if (!node) return;
    node.textContent = message;
    node.classList.toggle("error", error);
  };
  const value = (form, name) => String(new FormData(form).get(name) || "").trim();
  const formPayload = (form, keys) => Object.fromEntries(keys.map(key => [key, value(form, key) || null]));

  function activatePanel(name) {
    root.querySelectorAll("[data-panel]").forEach(panel => panel.classList.toggle("hidden", panel.dataset.panel !== name));
    root.querySelectorAll("[data-tab]").forEach(button => {
      const active = button.dataset.tab === name;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function populateSelect(id, records, labelFor) {
    const select = $(id);
    if (!select) return;
    const previous = select.value;
    const first = select.options[0]?.outerHTML || '<option value="">Choose</option>';
    select.innerHTML = first + records.map(record => '<option value="' + esc(record.id) + '">' + esc(labelFor(record)) + '</option>').join("");
    if (records.some(record => record.id === previous)) select.value = previous;
  }

  function renderOverview() {
    $("kpi-new-enquiries").textContent = state.enquiries.filter(x => x.status === "new").length;
    $("kpi-customers").textContent = state.customers.length;
    $("kpi-active-projects").textContent = state.projects.filter(x => x.status === "active").length;
    $("kpi-open-tasks").textContent = state.tasks.filter(x => x.status !== "done").length;
    const recentEnquiries = state.enquiries.slice(0, 5);
    $("overview-enquiries").innerHTML = recentEnquiries.length ? recentEnquiries.map(item =>
      '<div class="ops-list-row"><div><strong>' + esc(item.contact_name) + '</strong><small>' + esc(item.service) + ' · ' + dateLabel(item.created_at) + '</small></div><span class="status">' + esc(statusLabels[item.status] || item.status) + '</span></div>'
    ).join("") : empty("No enquiries recorded yet. Add the first conversation in Enquiries.");
    const active = state.projects.filter(x => ["planned", "active", "on-hold"].includes(x.status)).slice(0, 5);
    $("overview-projects").innerHTML = active.length ? active.map(item =>
      '<div class="ops-list-row"><div><strong>' + esc(item.title) + '</strong><small>' + esc(item.service) + ' · Due ' + dateLabel(item.due_date) + '</small></div><span class="status">' + esc(statusLabels[item.status] || item.status) + '</span></div>'
    ).join("") : empty("No active projects. Create a project once work is agreed.");
  }

  function renderEnquiries() {
    const filter = $("enquiry-filter").value;
    const rows = state.enquiries.filter(x => filter === "all" || x.status === filter);
    $("enquiry-list").innerHTML = rows.length ? '<table class="ops-table"><thead><tr><th>Contact</th><th>Service / details</th><th>Priority</th><th>Status</th></tr></thead><tbody>' + rows.map(item =>
      '<tr><td><strong>' + esc(item.contact_name) + '</strong><small>' + esc(item.business_name || item.contact_method || "No contact detail") + '</small><small>' + dateLabel(item.created_at) + '</small></td><td><strong>' + esc(item.service) + '</strong><small>' + esc(item.location || "Location not recorded") + '</small><small>' + esc(item.message || "") + '</small></td><td><span class="priority priority-' + esc(item.priority) + '">' + esc(item.priority) + '</span></td><td><select aria-label="Update enquiry status" data-update="enquiry" data-id="' + esc(item.id) + '" data-previous="' + esc(item.status) + '">' + ["new","contacted","qualified","converted","closed"].map(s => '<option value="' + s + '"' + (item.status === s ? " selected" : "") + '>' + statusLabels[s] + '</option>').join("") + '</select></td></tr>'
    ).join("") + '</tbody></table>' : empty("No enquiries in this view.");
  }

  function renderCustomers() {
    $("customer-count").textContent = state.customers.length + " records";
    $("customer-list").innerHTML = state.customers.length ? '<table class="ops-table"><thead><tr><th>Customer</th><th>Contact</th><th>Location</th></tr></thead><tbody>' + state.customers.map(item =>
      '<tr><td><strong>' + esc(item.full_name) + '</strong><small>' + esc(item.business_name || "Individual") + '</small></td><td>' + esc(item.phone || "—") + '<small>' + esc(item.email || "") + '</small></td><td>' + esc(item.location || "—") + '</td></tr>'
    ).join("") + '</tbody></table>' : empty("No customers saved yet. Add a customer when you begin working with them.");
  }

  function renderProjects() {
    const filter = $("project-filter").value;
    const rows = state.projects.filter(x => filter === "all" || x.status === filter);
    $("project-list").innerHTML = rows.length ? '<table class="ops-table"><thead><tr><th>Project</th><th>Due date</th><th>Quote</th><th>Status</th></tr></thead><tbody>' + rows.map(item =>
      '<tr><td><strong>' + esc(item.title) + '</strong><small>' + esc(item.service) + ' · ' + esc(item.customer?.full_name || "No customer linked") + '</small></td><td>' + dateLabel(item.due_date) + '</td><td>' + money(item.quote_amount, item.currency) + '</td><td><select aria-label="Update project status" data-update="project" data-id="' + esc(item.id) + '" data-previous="' + esc(item.status) + '">' + ["planned","active","on-hold","completed","cancelled"].map(s => '<option value="' + s + '"' + (item.status === s ? " selected" : "") + '>' + statusLabels[s] + '</option>').join("") + '</select></td></tr>'
    ).join("") + '</tbody></table>' : empty("No projects in this view.");
  }

  function renderTasks() {
    const filter = $("task-filter").value;
    const rows = state.tasks.filter(x => filter === "all" || (filter === "done" ? x.status === "done" : x.status !== "done"));
    $("task-list").innerHTML = rows.length ? '<table class="ops-table"><thead><tr><th>Task</th><th>Project / due</th><th>Status</th></tr></thead><tbody>' + rows.map(item =>
      '<tr><td><strong>' + esc(item.title) + '</strong><small><span class="priority priority-' + esc(item.priority) + '">' + esc(item.priority) + '</span></small></td><td>' + esc(item.project?.title || "Project") + '<small>' + dateLabel(item.due_date) + '</small></td><td><select aria-label="Update task status" data-update="task" data-id="' + esc(item.id) + '" data-previous="' + esc(item.status) + '">' + ["todo","in-progress","done"].map(s => '<option value="' + s + '"' + (item.status === s ? " selected" : "") + '>' + statusLabels[s] + '</option>').join("") + '</select></td></tr>'
    ).join("") + '</tbody></table>' : empty("No tasks in this view.");
  }

  async function loadData() {
    if (state.loading) return;
    state.loading = true;
    const [customers, enquiries, projects, tasks] = await Promise.all([
      db.from("customers").select("id,full_name,business_name,email,phone,location,created_at").order("created_at", { ascending: false }),
      db.from("enquiries").select("id,contact_name,business_name,contact_method,service,location,message,status,priority,preferred_date,created_at").order("created_at", { ascending: false }),
      db.from("projects").select("id,customer_id,title,service,status,due_date,quote_amount,currency,customer:customers(full_name,business_name)").order("created_at", { ascending: false }),
      db.from("project_tasks").select("id,project_id,title,status,priority,due_date,project:projects(title)").order("created_at", { ascending: false })
    ]);
    state.loading = false;
    const failure = [customers, enquiries, projects, tasks].find(result => result.error);
    if (failure) {
      console.error("Augusta operations data could not load:", failure.error);
      feedback("enquiry-feedback", "The operations records could not load. Check administrator access and refresh.", true);
      return;
    }
    state.customers = customers.data || [];
    state.enquiries = enquiries.data || [];
    state.projects = projects.data || [];
    state.tasks = tasks.data || [];
    populateSelect("project-customer", state.customers, x => x.full_name + (x.business_name ? " · " + x.business_name : ""));
    populateSelect("enquiry-customer", state.customers, x => x.full_name + (x.business_name ? " · " + x.business_name : ""));
    populateSelect("project-enquiry", state.enquiries, x => x.contact_name + " · " + x.service);
    populateSelect("task-project", state.projects, x => x.title);
    renderOverview(); renderEnquiries(); renderCustomers(); renderProjects(); renderTasks();
    state.ready = true;
  }

  async function saveForm(form, table, payload, feedbackId, success) {
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    feedback(feedbackId, "Saving…");
    const { error } = await db.from(table).insert(payload);
    button.disabled = false;
    if (error) {
      console.error("Augusta record save failed:", error);
      feedback(feedbackId, "Could not save this record. Check the fields and administrator access.", true);
      return false;
    }
    form.reset();
    feedback(feedbackId, success);
    await loadData();
    return true;
  }

  $("customer-form").addEventListener("submit", event => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = formPayload(form, ["full_name","business_name","email","phone","location","notes"]);
    if (!payload.full_name) return;
    saveForm(form, "customers", payload, "customer-feedback", "Customer saved.");
  });

  $("enquiry-form").addEventListener("submit", event => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = formPayload(form, ["contact_name","business_name","customer_id","contact_method","service","location","message","preferred_date","priority"]);
    payload.source = "admin";
    payload.consent_recorded = false;
    if (!payload.contact_name || !payload.service) return;
    saveForm(form, "enquiries", payload, "enquiry-feedback", "Enquiry saved. Add a follow-up status when you contact them.");
  });

  $("project-form").addEventListener("submit", event => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = formPayload(form, ["title","customer_id","enquiry_id","service","start_date","due_date","quote_amount","currency","description"]);
    if (!payload.title || !payload.service) return;
    if (payload.quote_amount !== null) payload.quote_amount = Number(payload.quote_amount);
    saveForm(form, "projects", payload, "project-feedback", "Project created.");
  });

  $("task-form").addEventListener("submit", event => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = formPayload(form, ["project_id","title","due_date","priority","description"]);
    if (!payload.project_id || !payload.title) return;
    saveForm(form, "project_tasks", payload, "task-feedback", "Task added to the project.");
  });

  root.addEventListener("change", async event => {
    const select = event.target.closest("select[data-update]");
    if (!select) return;
    const table = select.dataset.update === "enquiry" ? "enquiries" : select.dataset.update === "project" ? "projects" : "project_tasks";
    const previous = select.dataset.previous || select.value;
    const { error } = await db.from(table).update({ status: select.value }).eq("id", select.dataset.id);
    if (error) {
      console.error("Augusta status update failed:", error);
      select.value = previous;
      window.alert("The status could not be updated. Please refresh and try again.");
      return;
    }
    select.dataset.previous = select.value;
    await loadData();
  });

  root.querySelectorAll("[data-tab]").forEach(button => button.addEventListener("click", () => activatePanel(button.dataset.tab)));
  root.querySelectorAll("[data-go]").forEach(button => button.addEventListener("click", () => activatePanel(button.dataset.go)));
  root.querySelector("[data-refresh]").addEventListener("click", loadData);
  $("enquiry-filter").addEventListener("change", renderEnquiries);
  $("project-filter").addEventListener("change", renderProjects);
  $("task-filter").addEventListener("change", renderTasks);

  let lastUserId = null;
  db.auth.onAuthStateChange((_event, session) => {
    const nextId = session?.user?.id || null;
    if (nextId && nextId !== lastUserId) {
      lastUserId = nextId;
      loadData();
    }
    if (!nextId) {
      lastUserId = null;
      state.customers = []; state.enquiries = []; state.projects = []; state.tasks = [];
    }
  });
  db.auth.getSession().then(({ data }) => {
    if (data.session?.user) {
      lastUserId = data.session.user.id;
      loadData();
    }
  });
})();
