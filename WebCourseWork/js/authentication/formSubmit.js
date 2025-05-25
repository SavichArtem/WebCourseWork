import {validatePhone, validateEmail, validateBirthdate, validatePassword, validateConfirmPassword} from "./validation.js";
import { generateUsername } from "./usernameGenerator.js";
import { checkFieldExists, checkUsernameExists } from "./api.js";
import { validateUsername } from "./validation.js";
import { generateAutoPassword } from "./passwordGenerator.js";
import { showNotification } from "../notifications.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registrationForm");
  if (!form) return;

  const agreementModal = document.getElementById("agreementModal");
  const agreementLink = document.querySelector(".agreement-link");
  const modalClose = document.querySelector("#agreementModal .close");
  const agreeBtn = document.querySelector(".agree-btn");

  if (agreementLink) {
    agreementLink.addEventListener("click", (e) => {
      e.preventDefault();
      agreementModal.style.display = "block";
    });
  }

  if (modalClose) {
    modalClose.addEventListener("click", () => {
      agreementModal.style.display = "none";
    });
  }

  if (agreeBtn) {
    agreeBtn.addEventListener("click", () => {
      agreementModal.style.display = "none";
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === agreementModal) {
      agreementModal.style.display = "none";
    }
  });

  const phoneInput = document.getElementById("phone");
  const emailInput = document.getElementById("email");
  const birthdateInput = document.getElementById("birthdate");
  const passwordMethodSelect = document.getElementById("passwordMethod");
  const manualPasswordFields = document.getElementById("manualPasswordFields");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const firstNameInput = document.getElementById("firstName");
  const lastNameInput = document.getElementById("lastName");
  const usernameInput = document.getElementById("username");
  const generateUsernameBtn = document.getElementById("generateUsername");
  const agreementCheckbox = document.getElementById("agreement");
  const submitBtn = document.getElementById("submitBtn");

  let usernameAttempts = 0;

  const formElements = {
    phoneInput,
    emailInput,
    birthdateInput,
    passwordMethodSelect,
    manualPasswordFields,
    passwordInput,
    confirmPasswordInput,
    firstNameInput,
    lastNameInput,
    usernameInput,
    generateUsernameBtn,
    agreementCheckbox,
    submitBtn,
  };

  for (const [name, element] of Object.entries(formElements)) {
    if (!element) {
      console.error(`Form element ${name} is missing`);
      return;
    }
  }

  generateUsernameBtn.addEventListener("click", async () => {
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();

    if (!firstName || !lastName) {
      setError("usernameError", getTranslation("validation_required_fields"));
      return;
    }

    usernameAttempts++;

    let newUsername;
    let attempts = 0;
    let isUnique = false;

    while (attempts < 10 && !isUnique) {
      newUsername = generateUsername(
        firstName,
        lastName,
        usernameAttempts + attempts
      );
      isUnique = !(await checkUsernameExists(newUsername));
      attempts++;
    }

    usernameInput.value = newUsername;

    if (!isUnique) {
      setError("usernameError", getTranslation("username_generation_failed"));
    } else {
      setError("usernameError", "");
    }

    if (usernameAttempts >= 5) {
      generateUsernameBtn.disabled = true;
    }

    validateForm();
  });

  usernameInput.addEventListener("input", async () => {
    const username = usernameInput.value.trim();
    if (username.length > 0) {
      const exists = await checkUsernameExists(username);
      setError("usernameError", exists ? getTranslation("username_taken") : "");
    } else {
      setError("usernameError", "");
    }
    validateForm();
  });

  passwordMethodSelect.addEventListener("change", (e) => {
    if (e.target.value === "manual") {
      manualPasswordFields.style.display = "block";
    } else {
      manualPasswordFields.style.display = "none";
      setError("passwordError", "");
      setError("confirmPasswordError", "");
    }
    validateForm();
  });

  form.addEventListener("input", () => {
    validateForm();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = getTranslation("processing");

    try {
      const username = usernameInput.value.trim();
      const email = emailInput.value.trim();
      const phone = phoneInput.value.trim();

      if (!validateForm()) return;

      const [usernameExists, emailExists, phoneExists] = await Promise.all([
        checkFieldExists("username", username),
        checkFieldExists("email", email),
        checkFieldExists("phone", phone),
      ]);

      if (usernameExists) {
        setError("usernameError", getTranslation("username_taken"));
        return;
      }

      if (emailExists) {
        setError("emailError", getTranslation("email_taken"));
        return;
      }

      if (phoneExists) {
        setError("phoneError", getTranslation("phone_taken"));
        return;
      }

      const userData = {
        phone: phone,
        email: email,
        birthdate: birthdateInput.value,
        password:
          passwordMethodSelect.value === "auto"
            ? generateAutoPassword()
            : passwordInput.value,
        firstName: firstNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        middleName: document.getElementById("middleName")?.value.trim() || "",
        username: username,
        agreement: agreementCheckbox.checked,
        registrationDate: new Date().toISOString(),
        role: "user",
      };

      const postResponse = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!postResponse.ok) throw new Error("Registration error");

      const createdUser = await postResponse.json();

      localStorage.setItem("currentUser", JSON.stringify(createdUser));
      localStorage.setItem("isLoggedIn", "true");

      window.location.href = "menu.html";

      showNotification(getTranslation("registration_success"), "success");
      form.reset();
      usernameAttempts = 0;
      generateUsernameBtn.disabled = false;

      document.querySelectorAll(".error-message").forEach((el) => {
        el.textContent = "";
      });
    } catch (error) {
      console.error("Error:", error);
      showNotification(getTranslation("registration_error"), "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });

  function validateForm() {
    let isValid = true;

    const phoneError = validatePhone(phoneInput.value, phoneInput);
    setError("phoneError", phoneError);
    if (phoneError) isValid = false;

    const emailError = validateEmail(emailInput.value, emailInput);
    setError("emailError", emailError);
    if (emailError) isValid = false;

    const birthdateError = validateBirthdate(birthdateInput.value);
    setError("birthdateError", birthdateError);
    if (birthdateError) isValid = false;

    if (passwordMethodSelect.value === "manual") {
      const passwordError = validatePassword(passwordInput.value);
      setError("passwordError", passwordError);
      if (passwordError) isValid = false;

      const confirmPasswordError = validateConfirmPassword(
        passwordInput.value,
        confirmPasswordInput.value
      );
      setError("confirmPasswordError", confirmPasswordError);
      if (confirmPasswordError) isValid = false;
    }

    const usernameError = validateUsername(usernameInput.value);
    setError("usernameError", usernameError);
    if (usernameError) isValid = false;

    if (!firstNameInput.value.trim()) {
      setError("firstNameError", getTranslation("validation_required"));
      isValid = false;
    } else {
      setError("firstNameError", "");
    }

    if (!lastNameInput.value.trim()) {
      setError("lastNameError", getTranslation("validation_required"));
      isValid = false;
    } else {
      setError("lastNameError", "");
    }

    if (!usernameInput.value.trim()) {
      setError("usernameError", getTranslation("username_required"));
      isValid = false;
    }

    if (!agreementCheckbox.checked) {
      setError("agreementError", getTranslation("validation_required"));
      isValid = false;
    } else {
      setError("agreementError", "");
    }

    submitBtn.disabled = !isValid;
    return isValid;
  }

  function setError(elementId, errorKey) {
    const errorElement = document.getElementById(elementId);
    const inputElement = document.getElementById(
      elementId.replace("Error", "")
    );

    if (!errorElement || !inputElement) return;

    if (errorKey) {
      const errorText =
        window.getCurrentText()?.[errorKey]?.[window.getCurrentLang()] ||
        getDefaultErrorText(errorKey);
      errorElement.textContent = errorText;
      errorElement.dataset.errorKey = errorKey;
      inputElement.classList.add("invalid");
      inputElement.classList.remove("valid");
    } else {
      errorElement.textContent = "";
      delete errorElement.dataset.errorKey;
      inputElement.classList.add("valid");
      inputElement.classList.remove("invalid");
    }
  }

  function getDefaultErrorText(key) {
    const defaultTexts = {
      validation_phone: "Некорректный номер телефона. Пример: +375291234567",
      validation_email: "Некорректный email. Пример: example@mail.com",
      validation_required: "Это поле обязательно для заполнения",
    };
    return defaultTexts[key] || key;
  }

  function getTranslation(key) {
    const currentText = window.getCurrentText?.() || {};
    const currentLang = window.getCurrentLang?.() || "en";
    return currentText[key]?.[currentLang] || key;
  }
});
