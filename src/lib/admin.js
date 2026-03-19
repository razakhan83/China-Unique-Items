function normalizeEmail(email) {
  return (email || "").trim().toLowerCase();
}

function getConfiguredAdminEmails() {
  const emails = [
    process.env.ADMIN_EMAIL,
    ...(process.env.ADMIN_EMAILS || "").split(","),
  ]
    .map(normalizeEmail)
    .filter(Boolean);

  return Array.from(new Set(emails));
}

function isAdminEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return false;
  return getConfiguredAdminEmails().includes(normalizedEmail);
}

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function getPhoneRegex(phone) {
  const digits = normalizePhone(phone);
  if (!digits) return null;
  const pattern = digits.split("").join("\\D*");
  return new RegExp(`^\\D*${pattern}\\D*$`);
}

export { getConfiguredAdminEmails, isAdminEmail, normalizeEmail, normalizePhone, getPhoneRegex };
