/**
 * Client-side image compression pipeline.
 *
 * Runs entirely in the browser (canvas + createImageBitmap, no dependency),
 * so admins never have to leave Rekomendify to compress a photo. Output is
 * WebP when the browser can encode it (best size/quality ratio for photos),
 * otherwise JPEG.
 */

export type CompressResult = {
  blob: Blob;
  ext: "webp" | "jpg" | "png" | "gif";
  contentType: string;
  width: number;
  height: number;
  originalBytes: number;
  bytes: number;
};

// 1280px sudah lebih dari cukup untuk layar ponsel dan memangkas egress
// Storage secara signifikan dibanding 1600px.
const MAX_DIMENSION = 1280;
const QUALITY = 0.82;
/** Below this size a photo is already light enough; re-encoding gains little. */
const SKIP_BELOW_BYTES = 120 * 1024;

let webpSupport: boolean | null = null;
function supportsWebp(): boolean {
  if (webpSupport !== null) return webpSupport;
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    webpSupport = c.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    webpSupport = false;
  }
  return webpSupport;
}

/** Verifies real image content by magic bytes (rejects SVG / HTML / scripts). */
export async function detectImageType(
  file: Blob,
): Promise<{ ext: "jpg" | "png" | "gif" | "webp"; contentType: string } | null> {
  const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: "jpg", contentType: "image/jpeg" };
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a)
    return { ext: "png", contentType: "image/png" };
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38 && (b[4] === 0x37 || b[4] === 0x39) && b[5] === 0x61)
    return { ext: "gif", contentType: "image/gif" };
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50)
    return { ext: "webp", contentType: "image/webp" };
  return null;
}

async function decode(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; close: () => void }> {
  if (typeof createImageBitmap === "function") {
    const bmp = await createImageBitmap(file);
    return { source: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() };
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Gambar tidak dapat dibaca."));
      el.src = url;
    });
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => URL.revokeObjectURL(url) };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}

/**
 * Validates, resizes and re-encodes an image. Animated GIFs are passed through
 * untouched (canvas would flatten them to a single frame).
 */
export async function compressImage(file: File): Promise<CompressResult> {
  const detected = await detectImageType(file);
  if (!detected) throw new Error("File bukan gambar yang valid (JPG, PNG, WebP, atau GIF).");

  const passthrough = (): CompressResult => ({
    blob: file,
    ext: detected.ext,
    contentType: detected.contentType,
    width: 0,
    height: 0,
    originalBytes: file.size,
    bytes: file.size,
  });

  if (detected.ext === "gif") return passthrough();

  let decoded: Awaited<ReturnType<typeof decode>> | null = null;
  try {
    decoded = await decode(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(decoded.width, decoded.height));
    if (scale === 1 && file.size < SKIP_BELOW_BYTES) return passthrough();

    const width = Math.max(1, Math.round(decoded.width * scale));
    const height = Math.max(1, Math.round(decoded.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return passthrough();
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(decoded.source, 0, 0, width, height);

    const useWebp = supportsWebp();
    const type = useWebp ? "image/webp" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, QUALITY));
    if (!blob || blob.size === 0) return passthrough();
    // Never ship a "compressed" file that is bigger than the original.
    if (blob.size >= file.size && scale === 1) return passthrough();

    return {
      blob,
      ext: useWebp ? "webp" : "jpg",
      contentType: type,
      width,
      height,
      originalBytes: file.size,
      bytes: blob.size,
    };
  } catch {
    return passthrough();
  } finally {
    decoded?.close();
  }
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
