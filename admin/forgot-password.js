(() => {
  const button = document.getElementById("forgot-password");
  const emailInput = document.getElementById("email");
  const message = document.getElementById("login-message");
  const cfg = window.AUGUSTA_MEDIA_CONFIG || {};

  if (!button || !emailInput || !message) return;

  button.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    if (!email) {
      message.textContent = "Enter your admin email address first.";
      emailInput.focus();
      return;
    }
    if (!window.supabase || !cfg.supabaseUrl || !cfg.supabaseAnonKey) {
      message.textContent = "Password recovery is temporarily unavailable. Please try again later.";
      return;
    }

    button.disabled = true;
    message.textContent = "Sending password reset email…";
    try {
      const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
      const redirectTo = new URL("../reset-password.html", window.location.href).href;
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      message.textContent = "If an account exists for that email, a password reset link has been sent. Check your inbox and spam folder.";
    } catch (error) {
      message.textContent = error.message || "Could not send the reset email. Please try again.";
    } finally {
      button.disabled = false;
    }
  });
})();
