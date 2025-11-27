import { useState, useEffect, useCallback, useRef } from "react";
import FileBrowserCard from "./FileBrowserCard";
import FileContainerInputField from "./FileContainerInputField";
import { getCommonDirectoryPath, validateContainerPath } from "../utils/paths";
import FileWorkflowNameInputs from "./FileWorkflowNameInputs";
import { validateEmptyInputs, hydratedFiles } from "../utils/files";

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
    if (!isControlled) return;

    if (!validateEmptyInputs(inputs) && onMountCall.current) {
      // hydrate selected files from inputs

      const hydratedFilesList = hydratedFiles(inputs, mode);

      setSelectedFilesLocal(hydratedFilesList);

      const path = getCommonDirectoryPath(hydratedFilesList);
      const errorMsg = validateContainerPath(path);
      setContainerInputsPath({
        path,
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

    if (!selectedFilesLocal || selectedFilesLocal?.length === 0) {
      if (validateEmptyInputs(inputs)) return;
      handleFileBrowserInputChange([]);
      return;
    }

    const newInputs = selectedFilesLocal?.map((file) => ({
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
      {mode === "workflow" && (
        <FileWorkflowNameInputs
          selectedFiles={selectedFilesLocal}
          handleSetSelectedFiles={onSelectedFilesChange}
        />
      )}
      <FileBrowserCard
        selectedFiles={selectedFilesLocal}
        handleSetSelectedFiles={onSelectedFilesChange}
        handleResetFiles={onResetFiles}
        mode={mode}
      />
    </div>
  );
}
