function encode(data) {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&");
}

const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");
const emailField = document.getElementById("email");
const whatsappField = document.getElementById("whatsapp");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!emailField.value.trim() && !whatsappField.value.trim()) {
    status.textContent = "Preencha ao menos o e-mail ou o WhatsApp.";
    status.className = "form-status error";
    return;
  }

  const submitBtn = form.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  status.textContent = "Enviando...";
  status.className = "form-status";

  const data = Object.fromEntries(new FormData(form).entries());

  fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: encode(data),
  })
    .then(() => {
      status.textContent = "Mensagem enviada! Obrigado pelo contato.";
      status.className = "form-status success";
      form.reset();
      submitBtn.disabled = false;
    })
    .catch(() => {
      status.textContent = "Algo deu errado. Tente novamente.";
      status.className = "form-status error";
      submitBtn.disabled = false;
    });
});
