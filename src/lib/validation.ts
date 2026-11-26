/**
 * Central input validation, URL safety, binary magic-byte inspection,
 * CSV formula sanitization, and CSRF origin checks.
 */

export function sanitizeText(value: unknown, maxLength = 300): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Only allow relative internal paths (/media/..., /uploads/..., /logos/...)
 * or strict HTTPS URLs. Blocks javascript:, data:, vbscript:, and //host URLs.
 */
export function isSafeMediaUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed || trimmed.length > 1000) return false;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return !/[<>"'`\s]/.test(trimmed);
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Verifies real binary file headers (magic bytes) rather than trusting
 * client-supplied Content-Type headers.
 */
export function detectMediaFromMagicBytes(
  buf: Buffer
): { ext: string; mime: string } | null {
  if (buf.length < 12) return null;

  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: ".jpg", mime: "image/jpeg" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return { ext: ".png", mime: "image/png" };
  }

  // WebP: RIFF .... WEBP
  if (
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { ext: ".webp", mime: "image/webp" };
  }

  // ISO BMFF (MP4 / QuickTime MOV): .... ftyp
  if (buf.subarray(4, 8).toString("ascii") === "ftyp") {
    const brand = buf.subarray(8, 12).toString("ascii").trim();
    if (brand === "qt") {
      return { ext: ".mov", mime: "video/quicktime" };
    }
    return { ext: ".mp4", mime: "video/mp4" };
  }

  return null;
}

/**
 * Neutralizes spreadsheet formula injection (=, +, -, tab, CR, or @FUNC(...))
 * while preserving normal Instagram handles like @dika.fix cleanly.
 */
export function sanitizeCsvCell(raw: string): string {
  const text = String(raw ?? "");
  const isDangerous =
    /^[=+\-\t\r]/.test(text) || /^@[A-Za-z_]+\s*\(/.test(text);
  const safe = isDangerous ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

/**
 * Lightweight same-origin check to defend mutating routes against cross-site CSRF.
 */
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // Non-browser / same-origin server call
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!host) return false;
  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}
