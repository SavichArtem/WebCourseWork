const validationStates = new WeakMap();

export function initValidation(input) {
  validationStates.set(input, {
    touched: false,
    dirty: false,
  });
}

export function markAsTouched(input) {
  const state = validationStates.get(input);
  if (state) {
    state.touched = true;
    validationStates.set(input, state);
  }
}

export function markAsDirty(input) {
  const state = validationStates.get(input);
  if (state) {
    state.dirty = true;
    validationStates.set(input, state);
  }
}

export function setValidationState(inputElement, isValid, errorKey) {
  const errorElement = document.getElementById(`${inputElement.id}Error`);
  if (!errorElement) return;

  inputElement.classList.toggle("invalid", !isValid);
  inputElement.classList.toggle("valid", isValid);

  if (errorKey) {
    errorElement.textContent =
      window.getCurrentText()?.[errorKey]?.[window.getCurrentLang()] ||
      errorKey;
  } else {
    errorElement.textContent = "";
  }
}

export function shouldValidate(input) {
  const state = validationStates.get(input);
  return state ? state.touched || state.dirty : false;
}

export function validateUsername(username) {
  if (!username) return "validation_required";

  if (username.length < 3 || username.length > 20) {
    return "validation_username_length";
  }

  const regex = /^[a-zA-Z0-9_\-\.]+$/;
  if (!regex.test(username)) {
    return "validation_username_invalid";
  }

  return null;
}

export const validatePhone = (phone) => {
  if (!phone) return "validation_required";
  const regex = /^\+375(24|25|29|33|44)\d{7}$/;
  if (!regex.test(phone)) return "validation_phone";
  return null;
};

export const validateEmail = (email) => {
  if (!email) return "validation_required";

  if (!email.includes("@")) {
    return "validation_email_missing_at";
  }

  const parts = email.split("@");
  const localPart = parts[0];
  const domain = parts[1];

  if (/[а-яА-ЯЁё]/.test(localPart)) {
    return "validation_email_russian_chars";
  }

  if (!domain) {
    return "validation_email_invalid_domain";
  }

  if (!domain.includes(".")) {
    return "validation_email_missing_dot";
  }

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return "validation_email_invalid_domain";
  }

  return null;
};

export function validateBirthdate(birthdate) {
  if (!birthdate) return "validation_required";

  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  if (age < 16) {
    return "validation_age";
  }
  return "";
}

export function validatePassword(password) {
  if (!password) return "validation_required";
  if (password.length < 8 || password.length > 20)
    return "validation_password_length";
  if (!/[A-Z]/.test(password)) return "validation_password_uppercase";
  if (!/[a-z]/.test(password)) return "validation_password_lowercase";
  if (!/\d/.test(password)) return "validation_password_digit";
  if (!/[^A-Za-z0-9]/.test(password)) return "validation_password_special";
  return "";
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return "validation_required";
  if (password !== confirmPassword) return "validation_passwords_match";
  return "";
}
