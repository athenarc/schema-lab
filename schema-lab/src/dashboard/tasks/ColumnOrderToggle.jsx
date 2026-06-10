import {
  faArrowDownAZ,
  faArrowDownZA,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ColumnOrderToggle = ({ columnName, currentOrder, setOrder }) => {
  const active = currentOrder && currentOrder.endsWith(columnName);
  const asc = currentOrder && !currentOrder.startsWith("-");

  const icon = active && !asc ? faArrowDownZA : faArrowDownAZ;

  const handleSwitchOrder = () => {
    if (active && asc) {
      setOrder(`-${columnName}`);
    } else {
      setOrder(columnName);
    }
  };

  return (
    <span
      role="button"
      className={"fw-bold" + (active ? " text-primary" : " text-muted")}
      onClick={handleSwitchOrder}
    >
      <FontAwesomeIcon icon={icon} />
    </span>
  );
};

export default ColumnOrderToggle;
