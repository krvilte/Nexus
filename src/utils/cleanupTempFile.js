import fs from "fs";

const cleanupTempFile = (filePath) => {
  if (!filePath) return null;
  fs.unlinkSync(filePath);
};

export default cleanupTempFile;
