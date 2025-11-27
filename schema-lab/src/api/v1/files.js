import config from "../../config";

// Get list of files
export const getFiles = ({ auth, recursive = "yes" }) => {
  const qualifiedUrl = `${config.api.url}/storage/files?recursive=${recursive}`;
  return fetch(qualifiedUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${auth}`,
    },
  }).then((response) => response);
};

export const uploadFile = ({ path, file, auth, onProgress, signal }) => {
  if (!file) throw new Error("No file provided");

  const filePath = `${path}/${file.name}`;
  const payload = {
    path: filePath,
    size: file.size,
  };

  return new Promise((resolve, reject) => {
    // Listen for abort early (before starting upload)
    if (signal?.aborted) {
      reject(new Error("Upload aborted"));
      return;
    }

    const onAbort = () => {
      reject(new Error("Upload aborted"));
    };
    signal?.addEventListener("abort", onAbort);

    fetch(`${config.api.url}/storage/files`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then(async (data) => {
        const { upload_info } = data;

        if (upload_info.type === "multipart") {
          const parts = upload_info.urls.parts;
          const uploadResults = [];
          const partProgress = new Array(parts.length).fill(0);

          let aborted = false;

          // Helper to wrap XMLHttpRequest with abort support
          const uploadPart = (partInfo, index) => {
            const start = index * partInfo.n_bytes;
            const end = Math.min(start + partInfo.n_bytes, file.size);
            const blob = file.slice(start, end);

            return new Promise((res, rej) => {
              const xhr = new XMLHttpRequest();
              xhr.open("PUT", partInfo.url, true);

              // Abort xhr if signal aborts
              const abortHandler = () => {
                aborted = true;
                xhr.abort();
                rej(new Error("Upload aborted"));
              };
              signal?.addEventListener("abort", abortHandler);

              xhr.upload.addEventListener("progress", (e) => {
                if (e.lengthComputable) {
                  partProgress[index] = e.loaded;
                  const uploaded = partProgress.reduce((a, b) => a + b, 0);
                  const progress = Math.min((uploaded / file.size) * 100, 100);
                  onProgress?.(progress);
                }
              });

              xhr.onload = () => {
                signal?.removeEventListener("abort", abortHandler);
                if (xhr.status === 200) {
                  const etag = xhr.getResponseHeader("ETag");
                  if (!etag) {
                    rej(new Error(`Missing ETag for part ${partInfo.part}`));
                  } else {
                    uploadResults.push({
                      PartNumber: partInfo.part,
                      ETag: etag,
                    });
                    res();
                  }
                } else {
                  rej(new Error(`Part ${partInfo.part} failed`));
                }
              };

              xhr.onerror = () => {
                signal?.removeEventListener("abort", abortHandler);
                rej(new Error(`Part ${partInfo.part} failed`));
              };

              xhr.onabort = () => {
                signal?.removeEventListener("abort", abortHandler);
                rej(new Error("Upload aborted"));
              };

              xhr.send(blob);
            });
          };

          for (let i = 0; i < parts.length; i++) {
            if (aborted) break;
            await uploadPart(parts[i], i);
          }

          if (aborted) return;

          // Finalize multipart upload with XML body
          const xmlBody =
            `<?xml version="1.0" encoding="UTF-8"?>` +
            `<CompleteMultipartUpload>` +
            uploadResults
              .sort((a, b) => a.PartNumber - b.PartNumber)
              .map(
                (p) =>
                  `<Part><PartNumber>${p.PartNumber}</PartNumber><ETag>${p.ETag}</ETag></Part>`
              )
              .join("") +
            `</CompleteMultipartUpload>`;

          const finalizeResponse = await fetch(upload_info.urls.finalize, {
            method: "POST",
            headers: { "Content-Type": "application/xml" },
            body: xmlBody,
          });

          if (!finalizeResponse.ok) {
            throw new Error("Failed to finalize multipart upload");
          }

          signal?.removeEventListener("abort", onAbort);
          resolve({ success: true });
        } else {
          // Simple upload (non-multipart)
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", upload_info.url, true);

          // Abort handler for simple upload
          const abortHandler = () => {
            xhr.abort();
            reject(new Error("Upload aborted"));
          };
          signal?.addEventListener("abort", abortHandler);

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const progress = Math.min((e.loaded / e.total) * 100, 100);
              onProgress?.(progress);
            }
          });

          xhr.onload = () => {
            signal?.removeEventListener("abort", abortHandler);
            if (xhr.status === 200) {
              signal?.removeEventListener("abort", onAbort);
              resolve({ success: true });
            } else {
              reject(new Error(`Failed to upload file`));
            }
          };

          xhr.onerror = () => {
            signal?.removeEventListener("abort", abortHandler);
            reject(new Error(`Failed to upload file`));
          };

          xhr.onabort = () => {
            signal?.removeEventListener("abort", abortHandler);
            reject(new Error("Upload aborted"));
          };

          for (const [key, value] of Object.entries(
            upload_info.headers || {}
          )) {
            xhr.setRequestHeader(key, value);
          }

          xhr.send(file);
        }
      })
      .catch((err) => {
        signal?.removeEventListener("abort", onAbort);
        reject(err);
      });
  });
};

export const deleteFile = ({ auth, path }) => {
  const qualifiedUrl = `${config.api.url}/storage/files/${path}`;
  return fetch(qualifiedUrl, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${auth}`,
    },
  }).then(async (response) => {
    if (!response.ok) {
      const err = await response.json();

      if (err.detail) {
        throw new Error(err.detail);
      }

      if (typeof err === "object") {
        const messages = Object.values(err).flat().join(" | ");
        throw new Error(messages);
      }

      throw new Error("Failed to delete file");
    }
    return response;
  });
};

export const renameOrMoveFile = ({
  auth,
  oldPath,
  newPath,
  queryParams = {},
}) => {
  const url = new URL(`${config.api.url}/storage/files/${oldPath}`);

  Object.entries(queryParams).forEach(([key, value]) =>
    url.searchParams.append(key, value)
  );

  return fetch(url.toString(), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth}`,
    },
    body: JSON.stringify({ path: newPath }),
  }).then(async (response) => {
    if (!response.ok) {
      const err = await response.json();

      if (err.detail) {
        throw new Error(err.detail);
      }

      if (typeof err === "object") {
        const messages = Object.values(err).flat().join(" | ");
        throw new Error(messages);
      }

      throw new Error("Failed to rename file");
    }
    return response;
  });
};

export const getFileDownloadUrl = async ({ auth, path }) => {
  const encodedPath = encodeURIComponent(path);
  const url = `${config.api.url}/storage/files/${encodedPath}?action=download`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${auth}`,
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Failed to get download URL");
  }

  return response.json();
};

export const downloadFile = async ({ auth, path }) => {
  try {
    const { url, path: filePath } = await getFileDownloadUrl({ auth, path });
    const filename = filePath.split("\\").pop();

    const response = await fetch(url);
    if (!response.ok) throw new Error("Download failed");

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error("Download failed", err);
    alert(err.message || "Failed to download file");
  }
};

export async function unzipFile({ auth, zip_path, destination_path }) {
  const qualifiedUrl = `${config.api.url}/storage/files/unzip/`;

  const response = await fetch(qualifiedUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth}`,
    },
    body: JSON.stringify({ zip_path, destination_path }),
  });

  if (!response.ok) {
    const errorData = await response.json();

    throw new Error(errorData?.message || "Failed to unzip file");
  }

  return await response.json();
}

export async function getFileTypePreview({ auth, path }) {
  const { url } = await getFileDownloadUrl({ auth, path });

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch file");

  const blob = await response.blob();

  // Read first 8 bytes for magic number check
  const arrayBuffer = await blob.slice(0, 8).arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // Magic bytes check for png
  const isPng =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;

  const isJpg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;

  const isGif =
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38;

  if (isPng || isJpg || isGif) {
    return {
      type: "image",
      previewUrl: URL.createObjectURL(blob),
      mime: blob.type || "image/*",
    };
  }

  // If not an image, try to read as text
  const text = await blob.text();

  const isCsv = text.includes(",") && text.includes("\n");

  if (isCsv) {
    const previewLines = text.split(/\r?\n/).slice(0, 10).join("\n");

    return {
      type: "csv",
      previewText: previewLines,
    };
  }

  return {
    type: "unknown",
  };
}
