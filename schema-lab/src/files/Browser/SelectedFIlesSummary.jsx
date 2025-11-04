import { Button, Stack } from "react-bootstrap";

export function SelectedFilesSummary({ selectedFiles, handleResetFiles }) {
  return (
    <Stack direction="horizontal" className="p-2 w-100 justify-content-between">
      <div>
        <strong>{selectedFiles?.length}</strong> file(s) selected
      </div>
      <Button
        variant="primary"
        disabled={selectedFiles?.length === 0}
        onClick={() => {
          handleResetFiles();
        }}
      >
        Reset
      </Button>
    </Stack>
  );
}
