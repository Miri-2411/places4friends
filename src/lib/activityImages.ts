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
