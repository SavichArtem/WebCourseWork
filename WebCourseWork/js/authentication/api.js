export async function checkFieldExists(field, value) {
  try {
    const response = await fetch(
      `http://localhost:3000/users?${field}=${encodeURIComponent(value)}`
    );
    if (!response.ok) throw new Error("Network error");
    return (await response.json()).length > 0;
  } catch (error) {
    console.error("Check error:", error);
    return false;
  }
}

export async function checkUsernameExists(username) {
  return checkFieldExists("username", username);
}

export async function checkEmailExists(email) {
  return checkFieldExists("email", email);
}

export async function checkPhoneExists(phone) {
  return checkFieldExists("phone", phone);
}
