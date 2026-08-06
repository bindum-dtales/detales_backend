// Shared shape builder so every renderer returns the exact same normalized
// object (unset fields default to null instead of being omitted), without
// duplicating this object literal in all six renderers.
export function createAttachmentResult({
  type,
  renderer,
  html = null,
  viewer = null,
  mime = null,
  filename = null,
  storageUrl = null
}) {
  return { type, renderer, html, viewer, mime, filename, storageUrl };
}

export default { createAttachmentResult };
