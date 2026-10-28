const form = document.getElementById("contact-form");
const successBox = document.getElementById("success-box");

function setError(fieldId, errorId, message) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  field.classList.toggle("has-error", Boolean(message));
  error.textContent = message || "";
}

function isValidContact(value) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[+\d][\d\s-]{6,}$/;
  return emailPattern.test(value) || phonePattern.test(value);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  successBox.classList.remove("show");

  const name = document.getElementById("name").value.trim();
  const contact = document.getElementById("contact").value.trim();
  const message = document.getElementById("message").value.trim();

  let valid = true;

  if (name.length < 2) {
    setError("field-name", "error-name", "სახელი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს.");
    valid = false;
  } else {
    setError("field-name", "error-name", "");
  }

  if (!isValidContact(contact)) {
    setError("field-contact", "error-contact", "შეიყვანე ვალიდური ელფოსტა ან ტელეფონის ნომერი.");
    valid = false;
  } else {
    setError("field-contact", "error-contact", "");
  }

  if (message.length < 10) {
    setError("field-message", "error-message", "შეტყობინება უნდა შეიცავდეს მინიმუმ 10 სიმბოლოს.");
    valid = false;
  } else {
    setError("field-message", "error-message", "");
  }

  if (valid) {
    successBox.classList.add("show");
    form.reset();
  }
});
