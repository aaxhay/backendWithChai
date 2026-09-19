export function getPublicIdFromUrl(url) {
  if (!url || typeof url !== "string") return null;

  try {
    // Split the URL by '/upload/' to isolate everything after the core upload path
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;

    let rightSide = parts[1];

    rightSide = rightSide.replace(/(?:[a-z]_[a-zA-Z0-9,]+|v\d+)\//g, "");

    const publicIdWithFolder = rightSide.replace(/\.[^/.]+$/, "");

    return publicIdWithFolder;
  } catch (error) {
    console.error("Failed to parse Cloudinary URL:", error);
    return null;
  }
}
