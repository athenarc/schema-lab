import { useState, useEffect, useCallback, useRef } from "react";
import FileBrowserCard from "./FileBrowserCard";
import FileContainerInputField from "./FileContainerInputField";
import {
  getCommonDirectoryPrefix,
  validateContainerPath,
} from "../utils/paths";

function mapInputsToSelectedFiles(inputs) {
  // Map input file objects to selected files format for FileBrowserCard
  return inputs?.map((input) => ({
    path: input?.url || "",
    name: input?.name || "",
  }));
}

function validateEmptyInputs(inputs) {
  // Inputs are given as an array of file input objects by the parent component. An empty array also contains one empty object that
  // needs to be filtered out. This is done in order to avoid modifying the parent component logic.
  if (!inputs || inputs?.length === 0) return true;

  if (inputs?.length === 1) {
    const input = inputs[0];
    if (
      (!input?.name || input?.name?.trim() === "") &&
      (!input?.url || input?.url?.trim() === "") &&
      (!input?.path || input?.path?.trim() === "")
    ) {
      return true;
    }
  }

  return false;
}

function getCommonDirectoryPath(paths) {
  // Given an array of input file objects, extract their paths and find the common directory prefix.
  // This is necessary in task replication were multiple files have been selected and user must have specified a common container input path.
  // This path is not stored in the input objects so we need to compute it here.
  if (!paths || paths.length === 0) return "";

  const inputPaths = paths?.map((input) => input?.path).filter(Boolean);
  if (inputPaths?.length > 0) {
    return getCommonDirectoryPrefix(inputPaths);
  }
  return "";
}

export default function FileBrowser({ inputs, setInputs, mode = "picker" }) {
  // This component receives inputs and setInputs from parent to manage selected files
  //
  // It also manages local state for container path validation and selected files.
  // Mode can be "picker" or "viewer" to adjust UI accordingly.
  // Default mode is "picker".
  // In picker mode the user selects files and the path where they will be mounted in the container.
  //
  // Inputs is an array of file input objects with properties: name, url, path, type, content.
  // TODOS
  // When files are uploaded/deleted/renamed the refresh that follows loses the traversed folder state.
  // Add file preview
  // Add informational messages for empty states and errors.
  const isControlled = Boolean(inputs && setInputs);
  const [containerInputsPath, setContainerInputsPath] = useState({
    path: "",
    isValid: true,
    errorMsg: "",
  });
  const [selectedFilesLocal, setSelectedFilesLocal] = useState([]);

  const onMountCall = useRef(true);

  useEffect(() => {
    // Run this only on mount to sync initial inputs to local state

    if (!isControlled) {
      return;
    }
    if (onMountCall.current) {
      setSelectedFilesLocal(mapInputsToSelectedFiles(inputs));
      if (validateEmptyInputs(inputs)) {
        return;
      }
      setContainerInputsPath({
        path: getCommonDirectoryPath(inputs),
        isValid: true,
        errorMsg: "",
      });

      onMountCall.current = false;
    }
  }, [inputs, isControlled]);

  const onContainerInputsPathChange = useCallback(
    (newPath) => {
      const errorMsg = validateContainerPath(newPath);
      setContainerInputsPath({
        path: newPath,
        isValid: !errorMsg,
        errorMsg: errorMsg || "",
      });

      if (!isControlled) return;
      setInputs((prev) =>
        prev.map((input) => ({
          ...input,
          path: newPath
            ? `${newPath.replace(/\/?$/, "/")}${input?.path?.split("/").pop()}`
            : input.path || "",
        }))
      );
    },
    [setInputs, isControlled]
  );
  const onSelectedFilesChange = useCallback(
    (filesOrUpdater) => {
      setSelectedFilesLocal((prev) => {
        const files =
          typeof filesOrUpdater === "function"
            ? filesOrUpdater(prev)
            : filesOrUpdater;

        if (!files || files.length === 0) {
          if (isControlled) setInputs([]);
          return [];
        }

        if (isControlled) {
          const newInputs = files?.map((file) => ({
            name: file?.name || "",
            url: file?.path || "",
            path: containerInputsPath?.path
              ? `${containerInputsPath?.path?.replace(/\/?$/, "/")}${file?.path
                  ?.split("/")
                  .pop()}`
              : file?.path || "",
            type: "FILE",
            content: "",
          }));
          setInputs(newInputs);
        }

        return files;
      });
    },
    [setInputs, containerInputsPath, isControlled]
  );

  return (
    <div>
      {mode === "picker" && (
        <FileContainerInputField
          containerInputsPath={containerInputsPath}
          selectedFiles={selectedFilesLocal}
          handleContainerInputsPathChange={onContainerInputsPathChange}
        />
      )}

      <FileBrowserCard
        selectedFiles={selectedFilesLocal}
        handleSetSelectedFiles={onSelectedFilesChange}
        mode={mode}
      />
    </div>
  );
}
