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
  // Formats bytes into human-readable string
  if (bytes === 0 || !bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const isPreviewable = (path) => {
  // Determines if a file is previewable based on its extension
  if (!path) return false;
  const ext = path?.split(".")?.pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "bmp", "webp", "csv"].includes(ext);
};

const ColumnSortIcon = ({ columnKey, sortKey, sortOrder }) => {
  // Determines the sort icon based on the current sort state
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
  // Extracts the base filename from a given path
  // If the path is invalid, return an empty string
  if (!path) return "";
  const parts = path?.split(/[/\\]/);
  return parts[parts?.length - 1];
};

const fileOverwrite = ({ fileToUpload, files }) => {
  // Checks if uploading `fileToUpload` would overwrite an existing file in `files`
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
  // Recursively search for a folder by its name
  // If the folder is found, return it; otherwise, return null

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
  // Recursively calculate total files in the folder and its subfolders
  // If the folder is invalid, return 0

  if (!folder || typeof folder !== "object") return 0;

  const subTotals = Object?.entries(folder)
    ?.filter(([k]) => k !== "files" && k !== "totalFiles")
    ?.reduce((sum, [, data]) => sum + calculateTotalFiles(data), 0);
  if (folder) {
    folder.totalFiles = (folder?.files?.length || 0) + subTotals;
  }
  return folder?.totalFiles;
};

const groupFilesByFolder = (files) => {
  // Groups files into a nested folder structure based on their paths
  // Returns an object representing the folder hierarchy
  // Each folder contains its files and subfolders
  // Example output:
  // {
  //   "/": {
  //     files: [file1, file2],
  //     "subfolder": {
  //       files: [file3],
  //       "nested": {
  //         files: [file4]
  //       }
  //     }
  //   }
  // }
  const root = { "/": { files: [] } };

  for (const file of files) {
    const parts = file?.path?.replace(/^\/+/, "").split("/");
    let current = root["/"];

    if (parts?.length === 1) {
      current?.files?.push(file);
      continue;
    }

    for (const folder of parts?.slice(0, -1)) {
      current[folder] = current[folder] ?? { files: [] };
      current = current[folder];
    }

    current?.files?.push(file);
  }

  calculateTotalFiles(root["/"]);
  return root;
};

const calculateFoldersCount = (folderData) => {
  // Recursively counts the number of folders in the folderData object
  // Excludes 'files' and 'totalFiles' keys from the count

  let count = 0;
  for (const key in folderData) {
    if (key !== "files" && key !== "totalFiles") {
      count += 1 + calculateFoldersCount(folderData[key]);
    }
  }
  return count;
};

const useDebounce = (value, delay = 300) => {
  // Custom hook to debounce a value
  // Returns the debounced value after the specified delay
  // Useful for optimizing performance of search inputs, etc.

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
};

const validateContainerPath = (value) => {
  // Validates a container path string
  // Returns an error message string if invalid, or null if valid

  if (!value || !value.trim()) {
    return "The path can not be empty.";
  }

  if (!value.startsWith("/")) {
    return "The path must start with '/'.";
  }

  if (value?.includes(".")) {
    return "Path can not contain '.' characters.";
  }

  if (!value.endsWith("/")) {
    return "It is recommended to end with '/' to indicate a folder.";
  }

  return null; // Valid
};

// Utility: Find longest common directory prefix
const getCommonDirectoryPrefix = (paths) => {
  // Given an array of file paths, returns the longest common directory prefix
  // This is used in TaskForm when a task is loaded to determine the base directory for container inputs path
  if (!paths || paths?.length === 0) return "";

  // Split each path into segments
  const splitPaths = paths?.map(
    (p) => p?.split("/")?.filter(Boolean) // remove empty parts from leading slash
  );

  let prefixSegments = [];

  // Compare segment by segment
  for (let i = 0; i < splitPaths[0]?.length; i++) {
    const segment = splitPaths[0][i];
    if (splitPaths?.every((parts) => parts[i] === segment)) {
      prefixSegments?.push(segment);
    } else {
      break;
    }
  }

  if (prefixSegments?.length === 0) return "/"; // only root matches

  return "/" + prefixSegments?.join("/") + "/"; // always end with /
};

const folderContainsFiles = (folderData, files) => {
  // Checks if a folder (and its subfolders) contains a list of given file names
  if (!folderData || typeof folderData !== "object") return false;

  const filesSet = new Set(files?.map((f) => f?.path));

  // Check files in the current folder
  if (folderData?.files) {
    for (const file of folderData?.files) {
      const fileName = file?.path;
      // console.log(fileName, fileNamesSet);
      if (filesSet?.has(fileName)) {
        return true;
      }
    }
  }

  // Recursively check subfolders
  for (const key in folderData) {
    if (key !== "files" && key !== "totalFiles") {
      if (folderContainsFiles(folderData[key], files)) {
        return true;
      }
    }
  }

  return false;
};

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
  validateContainerPath,
  getCommonDirectoryPrefix,
  folderContainsFiles,
};
