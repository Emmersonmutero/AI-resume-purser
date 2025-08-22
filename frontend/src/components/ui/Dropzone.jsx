import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import '../../styles/Dropzone.css';

const Dropzone = ({ onFileDrop }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (onFileDrop) {
      onFileDrop(acceptedFiles[0]);
    }
  }, [onFileDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    multiple: false,
  });

  return (
    <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
      <input {...getInputProps()} />
      {
        isDragActive ?
          <p>Drop the files here ...</p> :
          <p>Drag 'n' drop a resume file here, or click to select a file</p>
      }
    </div>
  );
};

export default Dropzone;
