import { useState, useEffect, useCallback, useRef } from "react";
import FileBrowserCard from "./FileBrowserCard";
import FileContainerInputField from "./FileContainerInputField";
import {
  getCommonDirectoryPrefix,
  validateContainerPath,
} from "../utils/paths";
import FileWorkflowNameInputs from "./FileWorkflowNameInputs";

function validateEmptyInputs(inputs) {
  // Inputs are given as an array of file input objects by the parent component. An empty array also contains one empty object that
  // needs to be filtered out. This is done in order to avoid modifying the parent component logic.
  if (!inputs || inputs?.length === 0) return true;

  if (inputs?.length === 1) {
    const input = inputs[0];
    if (
      (!input?.name || input?.name?.trim() === "") &&
      (!input?.path || input?.path?.trim() === "") &&
      (!input?.url || input?.url?.trim() === "") &&
      (!input?.type || input?.type?.trim() === "") &&
      (!input?.content || input?.content?.trim() === "")
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
  if (!paths || paths?.length === 0) return "";

  const inputPaths = paths?.map((input) => input?.path).filter(Boolean);
  if (inputPaths?.length > 0) {
    return getCommonDirectoryPrefix(inputPaths);
  }
  return "";
}

export default function FileBrowser({
  inputs,
  handleFileBrowserInputChange,
  mode = "picker",
}) {
  // This component receives inputs and setInputs from parent to manage selected files
  //
  // It also manages local state for container path validation and selected files.
  // Mode can be "picker" or "viewer" to adjust UI accordingly.
  // Default mode is "picker".
  // In picker mode the user selects files and the path where they will be mounted in the container.
  //
  // Inputs is an array of file input objects with properties: name, url, path, type, content.
  // TODOS

  const isControlled = Boolean(inputs && handleFileBrowserInputChange);
  const [containerInputsPath, setContainerInputsPath] = useState({
    path: "",
    isValid: true,
    errorMsg: "",
  });
  const [selectedFilesLocal, setSelectedFilesLocal] = useState([]);

  const onMountCall = useRef(true);

  useEffect(() => {
    if (!isControlled) {
      return;
    }
    if (validateEmptyInputs(inputs)) {
      // Reset local state if clear all is triggered from parent
      setSelectedFilesLocal([]);
      setContainerInputsPath({
        path: "",
        isValid: true,
        errorMsg: "",
      });
      return;
    }
    if (onMountCall?.current) {
      if (validateEmptyInputs(inputs)) {
        return;
      }
      const path = getCommonDirectoryPath(inputs);
      const errorMsg = validateContainerPath(path);
      setContainerInputsPath({
        path: path,
        isValid: !errorMsg,
        errorMsg: errorMsg || "",
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
      handleFileBrowserInputChange((prev) =>
        prev.map((input) => ({
          ...input,
          path: newPath
            ? `${newPath.replace(/\/?$/, "/")}${input?.path?.split("/").pop()}`
            : input.path || "",
        }))
      );
    },
    [handleFileBrowserInputChange, isControlled]
  );

  const onSelectedFilesChange = useCallback((filesOrUpdater) => {
    setSelectedFilesLocal((prev) =>
      typeof filesOrUpdater === "function"
        ? filesOrUpdater(prev)
        : filesOrUpdater
    );
  }, []);

  useEffect(() => {
    if (!isControlled) return;

    if (!selectedFilesLocal || selectedFilesLocal.length === 0) {
      if (validateEmptyInputs(inputs)) return;
      handleFileBrowserInputChange([]);
      return;
    }

    const newInputs = selectedFilesLocal.map((file) => ({
      name: file?.name || "",
      url: file?.path || "",
      path: containerInputsPath?.path
        ? `${containerInputsPath?.path.replace(/\/?$/, "/")}${file?.path
            ?.split("/")
            .pop()}`
        : file?.path || "",
      type: "FILE",
      content: "",
    }));

    handleFileBrowserInputChange(newInputs);
  }, [selectedFilesLocal, containerInputsPath, isControlled]);

  const onResetFiles = () => {
    setSelectedFilesLocal([]);
    setContainerInputsPath({
      path: "",
      isValid: true,
      errorMsg: "",
    });
    if (isControlled) handleFileBrowserInputChange([]);
  };

  return (
    <div>
      {mode === "picker" && (
        <FileContainerInputField
          containerInputsPath={containerInputsPath}
          selectedFiles={selectedFilesLocal}
          handleContainerInputsPathChange={onContainerInputsPathChange}
        />
      )}
      {mode === "workflow" && <FileWorkflowNameInputs selectedFiles={selectedFilesLocal} handleSetSelectedFiles={onSelectedFilesChange}/>}
      <FileBrowserCard
        selectedFiles={selectedFilesLocal}
        handleSetSelectedFiles={onSelectedFilesChange}
        handleResetFiles={onResetFiles}
        mode={mode}
      />
    </div>
  );
}
