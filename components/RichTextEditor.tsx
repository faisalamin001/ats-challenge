// components/RichTextEditor.tsx
"use client";

import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { CustomParagraph } from './CustomParagraph';
import { CustomHeading } from './CustomHeading';
import { CustomBulletList } from './CustomBulletList';
import { CustomListItem } from './CustomListItem';

export interface RichTextEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
}

export interface RichTextEditorRef {
  updateContent: (newContent: string) => void;
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ initialValue, onChange }, ref) => {
    const hasInitialized = useRef(false);

    const editor = useEditor({
      // Disable built-in nodes so that our custom versions are used.
      extensions: [
        StarterKit.configure({
          paragraph: false,
          heading: false,
          bulletList: false,
          listItem: false,
        }),
        CustomParagraph,
        CustomHeading,
        CustomBulletList,
        CustomListItem,
      ],
      content: initialValue,

        immediatelyRender: false,
 
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
      },
    });

    // Expose an update method to the parent.
    useImperativeHandle(ref, () => ({
      updateContent: (newContent: string) => {
        if (editor) {
          editor.commands.setContent(newContent);
        }
      },
    }));

    useEffect(() => {
      if (editor && !hasInitialized.current) {
        editor.commands.setContent(initialValue);
        hasInitialized.current = true;
      }
    }, [editor, initialValue]);

    if (!editor) {
      return <div>Loading editor...</div>;
    }

    return (
      <>
        <EditorContent editor={editor} />
        <style jsx global>{`
          .ProseMirror:focus {
            outline: none;
          }
        `}</style>
      </>
    );
  }
);

export default RichTextEditor;
