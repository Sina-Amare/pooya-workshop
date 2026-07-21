const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** Convert any latin digits in a string/number to Persian digits. */
export function faNum(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

/** Convert Persian/Arabic digits to latin digits (for tel: links etc). */
export function enNum(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/** Normalize a phone number for use in tel:/wa.me links. */
export function phoneHref(phone: string): string {
  const digits = enNum(phone).replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (digits.startsWith("0")) return `+98${digits.slice(1)}`;
  return `+98${digits}`;
}

/** wa.me link from a phone number, with a prefilled greeting so the chat never starts blank. */
export function whatsappHref(
  phone: string,
  text = "سلام، می‌خواهم درباره یک پروژه مشورت بگیرم.",
): string {
  const number = phoneHref(phone).replace("+", "");
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

/** Group phone digits for display: 0912 345 6789 (in Persian digits). */
export function formatPhone(phone: string): string {
  const digits = enNum(phone).replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("09")) {
    return faNum(`${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`);
  }
  return faNum(phone);
}
