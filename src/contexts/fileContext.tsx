"use client"
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of the context
interface FileContextType {
  fileURL: string;
  setFileURL: (url: string) => void;
}

// Create the context with a default value
const FileContext = createContext<FileContextType | undefined>(undefined);

// Define the provider props type
interface FileContextProviderProps {
  children: ReactNode;
}

const FileContextProvider = ({ children }: FileContextProviderProps) => {
  const [fileURL, setFileURL] = useState<string>('');

  return (
    <FileContext.Provider value={{ fileURL, setFileURL }}>
      {children}
    </FileContext.Provider>
  );
};

// Custom hook for using the FileContext
const useFileContext = (): FileContextType => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFileContext must be used within a FileContextProvider');
  }
  return context;
};

export { FileContextProvider, useFileContext };
