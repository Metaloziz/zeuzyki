/** Маска ввода телефона для +375 */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const tail = digits.startsWith("375") ? digits.slice(3) : digits;
  const d = tail.slice(0, 9);

  if (d.length === 0) return "+375 ";

  let out = "+375 (";
  out += d.slice(0, 2);
  if (d.length >= 2) out += ") ";
  if (d.length > 2) out += d.slice(2, 5);
  if (d.length > 5) out += "-" + d.slice(5, 7);
  if (d.length > 7) out += "-" + d.slice(7, 9);
  return out;
}

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const tail = digits.startsWith("375") ? digits.slice(3) : digits;
  return `+375${tail.slice(0, 9)}`;
}
