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
  // This is used in TaskForm when a task is loaded to determine the base directory for container inputs path
  if (!paths?.length) return "";
  const splitPaths = paths?.map((p) => p?.split("/")?.filter(Boolean));

  let prefix = [];
  for (let i = 0; i < splitPaths[0]?.length; i++) {
    if (splitPaths?.every((parts) => parts[i] === splitPaths[0][i])) {
      prefix?.push(splitPaths[0][i]);
    } else break;
  }

  return prefix?.length ? "/" + prefix?.join("/") + "/" : "/";
};
