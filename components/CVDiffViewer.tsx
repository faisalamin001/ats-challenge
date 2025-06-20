// components/CVDiffViewer.tsx
"use client";

import React from "react";
import ReactDiffViewer from "react-diff-viewer";

interface CVDiffViewerProps {
  oldText: string;
  newText: string;
}

export default function CVDiffViewer({ oldText, newText }: CVDiffViewerProps) {
  return (
    <div className="diff-viewer">
      <ReactDiffViewer
        oldValue={oldText}
        newValue={newText}
        splitView={true}
        hideLineNumbers={false}
        useDarkTheme={false}
      />
    </div>
  );
}
