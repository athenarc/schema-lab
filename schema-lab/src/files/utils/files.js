export const hydratedFiles = (inputs, mode = "picker") => {
  // Converts input objects to hydrated file objects
  return inputs.map((i) => ({
    name:
      mode === "workflow"
        ? removeFileExtension(getBaseFilename(i?.url))
        : getBaseFilename(i?.url) || "",
    path: i?.url || "",
    fullPath: i?.url || "",
  }));
};

export const validateEmptyInputs = (inputs) => {
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
      (!input?.content || input?.content?.trim() === "") &&
      (!input?.description || input?.description?.trim() === "")
    ) {
      return true;
    }
  }

  return false;
};

// Returns the base filename from a path
export const getBaseFilename = (path) => {
  if (!path) return "";
  const parts = path?.split(/[/\\]/);
  return parts[parts?.length - 1];
};

export const removeFileExtension = (filename) => {
  if (!filename) return "";
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) return filename;
  return filename.substring(0, lastDotIndex);
};

// Checks if a file is previewable based on its extension
export const isPreviewableFile = (path) => {
  if (!path) return false;
  const ext = path?.split(".")?.pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "bmp", "webp", "csv"].includes(ext);
};

// Checks if uploading a file would overwrite an existing file in the list
export const wouldOverwriteFile = ({ fileToUpload, existingFiles }) => {
  if (!fileToUpload) return false;
  const uploadName = getBaseFilename(fileToUpload?.name);
  return existingFiles?.some((f) => getBaseFilename(f?.path) === uploadName);
};

export const validateFileName = (name) => {
  // Validates a file name according to specified rules
  // Rules:
  // - Starts with a letter (A-Z, a-z)
  // - Contains only letters, numbers, underscores (_), and hyphens (-)
  // - Length between 1 and 255 characters
  const nameRegex = /^[A-Za-z][A-Za-z0-9_]*$/;
  if (!name) return "No name provided";
  if (name.length < 1 || name.length > 255)
    return "Name must be between 1 and 255 characters";
  if (!nameRegex.test(name)) return "Name contains invalid characters";
  return ""; // Valid name
};

export const validateUniqueFileNames = (files) => {
  const namesSet = new Set();
  for (const file of files) {
    const name = file?.name || "";
    if (namesSet.has(name)) {
      return false;
    }
    namesSet.add(name);
  }
  return true;
};
