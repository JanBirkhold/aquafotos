/** Stay under serverActions.bodySizeLimit with headroom for multipart overhead */
export const UPLOAD_BATCH_MAX_BYTES = 20 * 1024 * 1024;

export function chunkFilesForUpload(
  files: File[],
  maxBytes = UPLOAD_BATCH_MAX_BYTES,
): File[][] {
  const batches: File[][] = [];
  let current: File[] = [];
  let currentSize = 0;

  for (const file of files) {
    if (file.size > maxBytes) {
      if (current.length > 0) {
        batches.push(current);
        current = [];
        currentSize = 0;
      }
      batches.push([file]);
      continue;
    }

    if (currentSize + file.size > maxBytes && current.length > 0) {
      batches.push(current);
      current = [];
      currentSize = 0;
    }

    current.push(file);
    currentSize += file.size;
  }

  if (current.length > 0) batches.push(current);
  return batches;
}
