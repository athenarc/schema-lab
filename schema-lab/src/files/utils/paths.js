export const validateContainerPath = (path) => {
  // Validates a string that will be the container path that will serve as the inputs directory
  // Returns an error message string if invalid, or null if valid

  if (path === undefined || path === null) return "The path cannot be empty.";
  if (!path?.trim()) return "The path cannot be empty.";
  if (!path?.startsWith("/")) return "The path must start with '/'.";
  if (path?.includes(".")) return "Path cannot contain '.' characters.";
  if (!path?.endsWith("/"))
    return "It is recommended to end with '/' to indicate a folder.";
  return null;
};

export const getCommonDirectoryPrefix = (paths) => {
  // Given an array of file paths, returns the longest common directory prefix
  // This is used in TaskForm when
  // 1) a task is loaded to determine the base directory for container inputs path
  // 2) User selects a file in FileBrowser on component mount
  // Returns an empty string if there is no common prefix
  if (!paths?.length) return "";

  const splitPaths = paths?.map((p) => p?.split("/")?.filter(Boolean));

  if (!splitPaths?.length || splitPaths?.length === 1) {
    return "/";
  }

  let prefix = [];
  for (let i = 0; i < splitPaths[0]?.length; i++) {
    if (splitPaths?.every((parts) => parts[i] === splitPaths[0][i])) {
      prefix?.push(splitPaths[0][i]);
    } else break;
  }

  return prefix?.length > 0 ? "/" + prefix?.join("/") + "/" : "/";
};

export const getCommonDirectoryPath = (paths) => {
  // Given an array of input file objects, extract their paths and find the common directory prefix.
  // This is necessary in task replication were multiple files have been selected and user must have specified a common container input path.
  // This path is not stored in the input objects so we need to compute it here.
  if (!paths || paths?.length === 0) return "";
  const inputPaths = paths?.map((input) => input?.path).filter(Boolean);

  if (inputPaths?.length > 0) {
    return getCommonDirectoryPrefix(inputPaths);
  }
  return "";
};
