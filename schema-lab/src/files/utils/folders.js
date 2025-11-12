// Groups files into a nested folder structure
export const buildFolderTree = (files) => {
  const root = { name: "/", fullPath: "/", files: [], subfolders: {} };

  for (const file of files) {
    const parts = file?.path?.replace(/^\/+/, "").split("/");
    let current = root;
    let currentPath = "/";

    for (let i = 0; i < parts.length - 1; i++) {
      const folder = parts[i];
      currentPath =
        currentPath === "/" ? `/${folder}` : `${currentPath}/${folder}`;

      if (!current.subfolders[folder]) {
        current.subfolders[folder] = {
          name: folder,
          fullPath: currentPath,
          files: [],
          subfolders: {},
        };
      }
      current = current.subfolders[folder];
    }

    current.files.push(file);
  }

  calculateTotalFiles(root);

  return root;
};

const calculateTotalFiles = (folder) => {
  let total = folder.files.length;
  for (const key in folder.subfolders) {
    total += calculateTotalFiles(folder.subfolders[key]);
  }
  folder.totalFiles = total;
  return total;
};
// Count total number of folders in a folder tree
export const countFolders = (folder) => {
  if (!folder) return 0;
  let count = Object.keys(folder.subfolders || {}).length;
  for (const key in folder.subfolders) {
    count += countFolders(folder.subfolders[key]);
  }
  return count;
};

// Check if a folder tree contains any of the given files
export const folderContainsFiles = (folder = {}, files = []) => {
  if (!folder || typeof folder !== "object") return false;
  const filePaths = new Set(files?.map((f) => f?.path));

  if (folder?.files?.some((f) => filePaths?.has(f?.path))) return true;

  for (const key in folder) {
    if (key !== "files" && key !== "totalFiles") {
      if (folderContainsFiles(folder[key], files)) return true;
    }
  }

  return false;
};

export function folderDoesNotContainFiles(folder = {}, files = []) {
  const missingFiles = [];
  for (const file of files) {
    if (!folderContainsFiles(folder, [file])) {
      missingFiles.push(file);
    }
  }
  return missingFiles.length > 0 ? missingFiles : false;
}

// Find a nested folder by key
// export const findNestedFolder = (obj, target) => {
//   for (const key in obj) {
//     if (key === target) return obj[key];
//     if (typeof obj[key] === "object") {
//       const found = findNestedFolder(obj[key], target);
//       if (found) return found;
//     }
//   }
//   return null;
// };

export const findNestedFolder = (folder, targetFullPath) => {
  if (folder.fullPath === targetFullPath) return folder;
  for (const key in folder.subfolders) {
    const found = findNestedFolder(folder.subfolders[key], targetFullPath);
    if (found) return found;
  }
  return null;
};
