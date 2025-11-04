import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDownAZ,
  faArrowDownZA,
} from "@fortawesome/free-solid-svg-icons";

const timestampToDateOptions = {
  year: "2-digit",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

const formatBytes = (bytes) => {
  if (bytes === 0 || !bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const isPreviewable = (path) => {
  if (!path) return false;
  const ext = path.split(".").pop().toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "bmp", "webp", "csv"].includes(ext);
};

const ColumnSortIcon = ({ columnKey, sortKey, sortOrder }) => {
  const isActive = sortKey === columnKey;
  const isAsc = sortOrder === "asc";
  const icon = isActive && isAsc ? faArrowDownZA : faArrowDownAZ;
  return (
    <FontAwesomeIcon
      icon={icon}
      className={`ms-1 ${isActive ? "text-primary" : "text-muted"}`}
    />
  );
};

const getFilenameFromPath = (path) => {
  if (!path) return "";
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1];
};

const fileOverwrite = ({ fileToUpload, files }) => {
  if (!fileToUpload) return false;

  // Get base name of fileToUpload.name (should be just the filename)
  const uploadFileName = getFilenameFromPath(fileToUpload.name);

  return files.some((existing) => {
    // Extract base filename from existing.name (strip path)
    const existingFileName = getFilenameFromPath(existing?.path);
    return existingFileName === uploadFileName;
  });
};

function findNestedFolder(obj, target) {
  for (const key in obj) {
    if (key === target) return obj[key];
    if (typeof obj[key] === "object") {
      const found = findNestedFolder(obj[key], target);
      if (found) return found;
    }
  }
  return null;
}

const calculateTotalFiles = (folder) => {
  const subTotals = Object.entries(folder)
    .filter(([k]) => k !== "files" && k !== "totalFiles")
    .reduce((sum, [, data]) => sum + calculateTotalFiles(data), 0);
  folder.totalFiles = (folder.files?.length || 0) + subTotals;
  return folder.totalFiles;
};

function groupFilesByFolder(files) {
  const root = { "/": { files: [] } };

  for (const file of files) {
    const parts = file.path.replace(/^\/+/, "").split("/");
    let current = root["/"];

    if (parts.length === 1) {
      current.files.push(file);
      continue;
    }

    for (const folder of parts.slice(0, -1)) {
      current[folder] ??= { files: [] };
      current = current[folder];
    }

    current.files.push(file);
  }

  calculateTotalFiles(root["/"]);
  return root;
}

const calculateFoldersCount = (folderData) => {
  let count = 0;
  for (const key in folderData) {
    if (key !== "files" && key !== "totalFiles") {
      count += 1 + calculateFoldersCount(folderData[key]);
    }
  }
  return count;
};

const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export {
  timestampToDateOptions,
  formatBytes,
  isPreviewable,
  calculateFoldersCount,
  findNestedFolder,
  groupFilesByFolder,
  ColumnSortIcon,
  getFilenameFromPath,
  fileOverwrite,
  useDebounce,
};
