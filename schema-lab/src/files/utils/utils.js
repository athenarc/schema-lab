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

export {
  timestampToDateOptions,
  formatBytes,
  isPreviewable,
  ColumnSortIcon,
  getFilenameFromPath,
  fileOverwrite,
};
