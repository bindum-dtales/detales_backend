// Single source of truth mapping a file extension to its attachment
// category ("type") and the renderer key that should handle it. Adding a
// new supported extension is one entry here — no other module changes.
const EXTENSION_RENDERER_MAP = {
  docx: { type: "document", renderer: "docx" },

  txt: { type: "document", renderer: "text" },

  md: { type: "document", renderer: "markdown" },

  pdf: { type: "document", renderer: "pdf" },

  csv: { type: "spreadsheet", renderer: "spreadsheet" },
  xls: { type: "spreadsheet", renderer: "spreadsheet" },
  xlsx: { type: "spreadsheet", renderer: "spreadsheet" },
  ods: { type: "spreadsheet", renderer: "spreadsheet" },

  jpg: { type: "image", renderer: "image" },
  jpeg: { type: "image", renderer: "image" },
  png: { type: "image", renderer: "image" },
  gif: { type: "image", renderer: "image" },
  bmp: { type: "image", renderer: "image" },
  webp: { type: "image", renderer: "image" },
  svg: { type: "image", renderer: "image" },
  avif: { type: "image", renderer: "image" },
  tif: { type: "image", renderer: "image" },
  tiff: { type: "image", renderer: "image" }
};

export function getExtension(filename = "") {
  const match = /\.([^.]+)$/.exec(filename);
  return match ? match[1].toLowerCase() : "";
}

// Returns { type, renderer } or null if the extension isn't supported.
export function detect(filename) {
  const extension = getExtension(filename);
  return EXTENSION_RENDERER_MAP[extension] ?? null;
}

export default { getExtension, detect };
