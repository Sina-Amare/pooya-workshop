/**
 * Build a URL-friendly slug that keeps Persian characters readable.
 * "کابینت آشپزخانه مدرن" -> "کابینت-آشپزخانه-مدرن"
 */
export function slugify(input: string): string {
  return input
    .trim()
    .replace(/[‌‏‎]/g, " ") // ZWNJ / direction marks -> space
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

/** Ensure slug uniqueness within a list by appending a counter. */
export function uniqueSlug(base: string, taken: Set<string>): string {
  const root = slugify(base) || "item";
  if (!taken.has(root)) return root;
  let i = 2;
  while (taken.has(`${root}-${i}`)) i += 1;
  return `${root}-${i}`;
}

export function newId(prefix: string): string {
  const rand = crypto.randomUUID().slice(0, 8);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}
