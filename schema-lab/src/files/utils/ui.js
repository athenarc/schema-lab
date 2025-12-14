import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDownAZ,
  faArrowDownZA,
} from "@fortawesome/free-solid-svg-icons";

// Sort icon component for table headers
export const ColumnSortIcon = ({ columnKey, sortKey, sortOrder }) => {
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
