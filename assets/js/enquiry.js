(() => {
  const form = document.querySelector("#enquiry");
  const status = document.querySelector("#status");
  if (!form || !status) return;

  const setStatus = (message, state) => {
    status.textContent = message;
    status.dataset.state = state || "";
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const endpoint = window.AUGUSTA_CONFIG && window.AUGUSTA_CONFIG.enquiryEndpoint;
    if (!endpoint) {
      setStatus("Enquiries are being connected. Please try again shortly.", "error");
      return;
    }

    const submit = form.querySelector("[type=\"submit\"]");
    const data = Object.fromEntries(new FormData(form).entries());
    data.consent = form.elements.consent.checked;
    data.source = "augusta-website";

    submit.disabled = true;
    submit.setAttribute("aria-busy", "true");
    setStatus("Sending your enquiry…", "pending");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error || "Unable to send enquiry");
      form.reset();
      setStatus("Thank you. Augusta has received your enquiry and will reply using the contact detail you shared.", "success");
    } catch (error) {
      setStatus("Your enquiry could not be sent just now. Please try again in a few minutes.", "error");
    } finally {
      submit.disabled = false;
      submit.removeAttribute("aria-busy");
    }
  });
})();
