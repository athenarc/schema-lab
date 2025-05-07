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

// Upload a file
export const uploadFile = ({ file, auth, onProgress }) => {
  if (!file) throw new Error("No file provided");

  const filePath = `uploads/${file.name}`;
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
      .then((data) => {
        const { upload_info } = data;
        const xhr = new XMLHttpRequest();

        xhr.open("PUT", upload_info.url, true);

        // Remove the Authorization header if it's already in upload_info.headers
        if (upload_info.headers && upload_info.headers.Authorization) {
          delete upload_info.headers.Authorization; // Avoid overwriting the Authorization
        }

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            onProgress(progress); // Call onProgress with the current progress
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

        // Send the file with the correct headers
        for (const [key, value] of Object.entries(upload_info.headers || {})) {
          xhr.setRequestHeader(key, value);
        }

        xhr.send(file);
      })
      .catch(reject);
  });
};
