import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import styles from "./DragDropBox.module.css";

type DragDropBoxProps = {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
};

export default function DragDropBox({
  selectedFile,
  onFileSelect,
}: DragDropBoxProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect],
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: {
        "application/pdf": [".pdf"],
      },
      multiple: false,
      maxFiles: 1,
    });

  return (
    <>
      <div
        {...getRootProps()}
        className={`${styles.dropzone} ${isDragActive ? styles.active : ""}`}
      >
        <input {...getInputProps()} />
        <p>Drop your transcript PDF here</p>
        <p>or</p>
        <p>Click to select PDF</p>
      </div>

      {selectedFile && (
        <p>
          <b>Selected file:</b> {selectedFile.name}
        </p>
      )}
      {fileRejections.length > 0 && <p>Please upload only one PDF file.</p>}
    </>
  );
}
