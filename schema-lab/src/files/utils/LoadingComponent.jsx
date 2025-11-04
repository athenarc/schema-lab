import { Spinner } from "react-bootstrap";

export default function LoadingComponent({ message }) {
  return (
    <div className="d-flex flex-column h-100 m-auto justify-content-center align-items-center">
      <Spinner animation="border" role="status" variant="primary" />
      <span className="mt-2">{message || "Loading..."}</span>
    </div>
  );
}
