// Groups files into a nested folder structure
export const buildFolderTree = (files) => {
  const root = { "/": { files: [] } };

  for (const file of files) {
    const parts = file?.path?.replace(/^\/+/, "").split("/");
    let current = root["/"];
    if (parts.length === 1) {
      current.files.push(file);
      continue;
    }
    for (const folder of parts.slice(0, -1)) {
      current[folder] = current[folder] ?? { files: [] };
      current = current[folder];
    }
    current.files.push(file);
  }

  calculateTotalFiles(root["/"]);
  return root;
};

// Recursively calculate total files in folder tree
export const calculateTotalFiles = (folder) => {
  if (!folder || typeof folder !== "object") return 0;

  const subTotals = Object.entries(folder)
    .filter(([k]) => k !== "files" && k !== "totalFiles")
    .reduce((sum, [, data]) => sum + calculateTotalFiles(data), 0);

  folder.totalFiles = (folder.files?.length || 0) + subTotals;
  return folder.totalFiles;
};

// Recursively count folders
export const countFolders = (folder) => {
  let count = 0;
  for (const key in folder) {
    if (key !== "files" && key !== "totalFiles") {
      count += 1 + countFolders(folder[key]);
    }
  }
  return count;
};

// Check if a folder tree contains any of the given files
export const folderContainsFiles = (folder, files) => {
  if (!folder || typeof folder !== "object") return false;
  const filePaths = new Set(files.map((f) => f.path));

  if (folder.files?.some((f) => filePaths.has(f.path))) return true;

  for (const key in folder) {
    if (key !== "files" && key !== "totalFiles") {
      if (folderContainsFiles(folder[key], files)) return true;
    }
  }

  return false;
};

// Find a nested folder by key
export const findNestedFolder = (obj, target) => {
  for (const key in obj) {
    if (key === target) return obj[key];
    if (typeof obj[key] === "object") {
      const found = findNestedFolder(obj[key], target);
      if (found) return found;
    }
  }
  return null;
};
