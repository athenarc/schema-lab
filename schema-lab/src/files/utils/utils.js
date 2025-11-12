import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDownAZ,
  faArrowDownZA,
  faCircleCheck,
  faCircleInfo,
  faTriangleExclamation,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

const timestampToDateOptions = {
  year: "2-digit",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

const getStatusIcon = (type) => {
  switch (type) {
    case "success":
      return faCircleCheck;
    case "error":
      return faTimesCircle;
    case "warning":
      return faTriangleExclamation;
    default:
      return faCircleInfo;
  }
};

const formatBytes = (bytes) => {
  // Formats bytes into human-readable string
  if (bytes === 0 || !bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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

export { timestampToDateOptions, formatBytes, ColumnSortIcon, getStatusIcon };
