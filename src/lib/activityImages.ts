/**
 * Every activity photo exists twice in Storage: the full-size object whose URL
 * is stored on the row, and a 720 px derivative beside it under the same name
 * plus `.thumb`, written by the mobile app when the photo is uploaded.
 *
 * Storage egress — not disk — is this project's tightest budget, and a feed tile
 * that draws 80 px while downloading a 1440 px JPEG was the largest single
 * source of it. Every *browsing* surface therefore renders the derivative
 * (see ActivityPhoto); only the lightbox fetches the full size.
 */

/** `.thumb` inserted before the extension, query string preserved. */
function withThumbSuffix(pathOrUrl: string): string | null {
  const [base, query] = pathOrUrl.split("?", 2);
  const slash = base.lastIndexOf("/");
  const dot = base.lastIndexOf(".");
  if (dot <= slash) return null;
  const thumb = `${base.slice(0, dot)}.thumb${base.slice(dot)}`;
  return query === undefined ? thumb : `${thumb}?${query}`;
}

/**
 * Public URL of the derivative, or `null` when this is not one of our activity
 * images — an externally hosted URL has no derivative to ask for.
 *
 * The name is derived rather than stored, so there is no second column to keep
 * in step. Photos uploaded through the website (and any post predating
 * derivatives) have no `.thumb` object, so callers must treat a 404 as "use the
 * original" rather than an error; see ActivityPhoto.
 */
export function activityThumbUrl(url: string): string | null {
  if (!url.includes("/activity-images/")) return null;
  return withThumbSuffix(url);
}

// ---------------------------------------------------------------------------
// Upload pipeline
// ---------------------------------------------------------------------------

/**
 * Every picked file goes through `prepareImage` before it reaches Storage, and
 * that is a privacy boundary, not an optimisation.
 *
 * The website used to upload the `File` straight from the input element. A
 * phone photo carries an EXIF block with a GPS IFD — the coordinates the shot
 * was taken at — and the `activity-images` bucket is PUBLIC, so every object is
 * readable by anyone holding its URL. Raw uploads therefore published a
 * location the user never chose to share. Drawing through a canvas is what
 * fixes it: the canvas holds pixels only, so re-encoding the bitmap cannot
 * carry metadata across. It also normalises HEIC and cuts egress, which is this
 * project's tightest budget, but the metadata is the reason there is no
 * unprocessed fallback path.
 *
 * The mobile app does the same thing with `expo-image-manipulator`; the sizes,
 * the 4 MB ceiling, the `<uid>/` path shape and the `.thumb` derivative below
 * are all deliberately identical, so a photo looks the same whichever client
 * uploaded it.
 */

/** Feed photos: 1440 px covers a full-screen lightbox on a dense display. */
const IMAGE_OPTIONS = { maxEdge: 1440, quality: 0.75 };

/** The derivative every browsing surface renders — see the note at the top. */
const THUMB_OPTIONS = { maxEdge: 720, quality: 0.6 };

/** The bucket's own limit. Exceeding it fails the upload with English prose. */
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/**
 * One year. Safe because a path carries a timestamp and is never overwritten,
 * so the bytes at a URL cannot change — only the URL does.
 */
const IMMUTABLE_CACHE_CONTROL = String(365 * 24 * 60 * 60);

/**
 * The random part of an object name.
 *
 * The bucket is public, so the path is the only thing gating the file, and the
 * two other components — the uploader's id (readable off `profiles`) and a
 * millisecond timestamp — are both cheap to guess. Twelve base36 characters are
 * what actually makes a URL unguessable. Fixed length because `toString(36)` is
 * not: a double that lands exactly on 0.5 renders as one digit.
 */
function randomSegment(): string {
  const draw = () => Math.random().toString(36).slice(2).padEnd(6, "0").slice(0, 6);
  return draw() + draw();
}

/**
 * Decode to a bitmap with the EXIF rotation already applied.
 *
 * `imageOrientation: "from-image"` matters precisely because we are about to
 * throw the metadata away: a portrait iPhone photo is stored landscape with an
 * "rotate 90°" tag, and dropping that tag without baking the rotation in would
 * leave every such photo sideways. Older Safari rejects the option, so fall
 * back to a plain decode there rather than failing the upload.
 */
async function decode(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return await createImageBitmap(file);
  }
}

/** Draw the bitmap at `maxEdge` and re-encode as JPEG. */
async function render(bitmap: ImageBitmap, maxEdge: number, quality: number): Promise<Blob> {
  const longest = Math.max(bitmap.width, bitmap.height);
  const scale = longest > maxEdge ? maxEdge / longest : 1;
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Bild konnte nicht verarbeitet werden.");

  // JPEG has no alpha channel, so a transparent PNG would otherwise composite
  // onto black. White matches how the app renders a photo tile.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
  if (!blob) throw new Error("Bild konnte nicht verarbeitet werden.");
  return blob;
}

/**
 * Resize + re-encode, trying progressively harder if the result would be
 * refused by the bucket. The first attempt is what the caller asked for and
 * normally wins by a wide margin (1440 px at q0.75 lands around 250 kB against
 * a 4 MB ceiling); the rest exist for the 48 MP panorama, where a visibly
 * smaller photo beats a failed post.
 */
async function prepareImage(
  bitmap: ImageBitmap,
  { maxEdge, quality }: { maxEdge: number; quality: number }
): Promise<Blob> {
  const attempts = [
    { maxEdge, quality },
    { maxEdge: Math.round(maxEdge * 0.75), quality: Math.max(0.5, quality - 0.15) },
    { maxEdge: Math.round(maxEdge * 0.5), quality: 0.5 },
  ];
  for (const attempt of attempts) {
    const blob = await render(bitmap, attempt.maxEdge, attempt.quality);
    if (blob.size <= MAX_UPLOAD_BYTES) return blob;
  }
  throw new Error("Dieses Bild ist zu groß zum Hochladen. Bitte wähle ein kleineres Foto.");
}

/**
 * Upload picked files to `activity-images` and return their public URLs.
 *
 * Two objects per photo, matching the app: the full-size one whose URL is
 * stored on the row, and the 720 px derivative beside it under the same name
 * plus `.thumb`, which is what every list and grid actually renders. The
 * derivative is best-effort — `ActivityPhoto` falls back to the original on a
 * 404, the same path every pre-derivative post takes — so a failure there costs
 * bandwidth, not the post.
 *
 * Named `<uid>/…` rather than with a flat filename. Two things depend on it:
 * the per-photo credit badge recovers the uploader from the path, and the
 * bucket's INSERT policy can only be tightened to owner-scoped writes once no
 * client writes flat names any more.
 *
 * Throws a German, user-presentable message when a file cannot be decoded —
 * a HEIC in a browser that has no decoder for it is the realistic case. There
 * is deliberately no "upload it unprocessed instead" branch; see the note at
 * the top of this section.
 */
export async function uploadActivityImages(
  supabase: { storage: SupabaseStorage },
  userId: string,
  files: File[]
): Promise<string[]> {
  const urls: string[] = [];

  for (const file of files) {
    let bitmap: ImageBitmap;
    try {
      bitmap = await decode(file);
    } catch {
      throw new Error(
        `„${file.name}“ konnte nicht gelesen werden. Bitte wähle ein JPEG oder PNG.`
      );
    }

    try {
      const full = await prepareImage(bitmap, IMAGE_OPTIONS);
      const path = `${userId}/${Date.now()}-${randomSegment()}.jpg`;

      const { error } = await supabase.storage
        .from("activity-images")
        .upload(path, full, { contentType: "image/jpeg", cacheControl: IMMUTABLE_CACHE_CONTROL });
      if (error) throw new Error(`Fehler beim Hochladen eines Bildes: ${error.message}`);

      const { data } = supabase.storage.from("activity-images").getPublicUrl(path);
      if (data?.publicUrl) urls.push(data.publicUrl);

      const thumbPath = withThumbSuffix(path);
      if (thumbPath) {
        try {
          const thumb = await prepareImage(bitmap, THUMB_OPTIONS);
          await supabase.storage.from("activity-images").upload(thumbPath, thumb, {
            contentType: "image/jpeg",
            cacheControl: IMMUTABLE_CACHE_CONTROL,
          });
        } catch {
          // Best-effort — see above.
        }
      }
    } finally {
      bitmap.close();
    }
  }

  return urls;
}

/** The slice of the Supabase client this module uses. */
interface SupabaseStorage {
  from(bucket: string): {
    upload(
      path: string,
      body: Blob,
      options?: { contentType?: string; cacheControl?: string; upsert?: boolean }
    ): Promise<{ error: { message: string } | null }>;
    getPublicUrl(path: string): { data: { publicUrl: string } };
  };
}
