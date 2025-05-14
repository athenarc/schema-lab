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

export const uploadFile = ({ path, file, auth, onProgress }) => {
  if (!file) throw new Error("No file provided");

  const filePath = `${path}/${file.name}`;
  const payload = {
    path: filePath,
    size: file.size,
  };

  return new Promise((resolve, reject) => {
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

          const uploadPart = (partInfo, index) => {
            const start = index * partInfo.n_bytes;
            const end = Math.min(start + partInfo.n_bytes, file.size);
            const blob = file.slice(start, end);

            return new Promise((res, rej) => {
              const xhr = new XMLHttpRequest();
              xhr.open("PUT", partInfo.url, true);

              xhr.upload.addEventListener("progress", (e) => {
                if (e.lengthComputable) {
                  partProgress[index] = e.loaded;
                  const uploaded = partProgress.reduce((a, b) => a + b, 0);
                  const progress = Math.min((uploaded / file.size) * 100, 100);
                  onProgress?.(progress);
                }
              });

              xhr.onload = () => {
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

              xhr.onerror = () =>
                rej(new Error(`Part ${partInfo.part} failed`));
              xhr.send(blob);
            });
          };

          for (let i = 0; i < parts.length; i++) {
            await uploadPart(parts[i], i);
          }

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

          resolve({ success: true });
        } else {
          // Simple upload (non-multipart)
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", upload_info.url, true);

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const progress = Math.min((e.loaded / e.total) * 100, 100);
              onProgress?.(progress);
            }
          });

          xhr.onload = () => {
            if (xhr.status === 200) {
              resolve({ success: true });
            } else {
              reject(new Error(`Failed to upload file`));
            }
          };

          xhr.onerror = () => reject(new Error(`Failed to upload file`));

          for (const [key, value] of Object.entries(
            upload_info.headers || {}
          )) {
            xhr.setRequestHeader(key, value);
          }

          xhr.send(file);
        }
      })
      .catch(reject);
  });
};

export const deleteFile = ({ auth, path }) => {
  const qualifiedUrl = `${config.api.url}/storage/files/${path}`;
  return fetch(qualifiedUrl, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${auth}`,
    },
  }).then((response) => response);
};
