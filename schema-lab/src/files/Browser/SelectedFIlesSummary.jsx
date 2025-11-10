import { Button, Stack } from "react-bootstrap";

export function SelectedFilesSummary({
  selectedFiles,
  handleResetFiles,
  mode,
}) {
  return (
    <div className="p-2 w-100 ">
      {mode === "picker" && (
        <Stack direction="horizontal" className="justify-content-between" gap={3}>
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
      )}
    </div>
  );
}
