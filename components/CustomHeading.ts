// components/CustomHeading.ts
import Heading from '@tiptap/extension-heading';
import { mergeAttributes } from '@tiptap/core';

export const CustomHeading = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute('style'),
        renderHTML: (attributes) =>
          attributes.style ? { style: attributes.style } : {},
      },
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    // Use the level from the node, default to h2 if not provided.
    return [
      node.attrs.level ? `h${node.attrs.level}` : 'h2',
      mergeAttributes(HTMLAttributes),
      0,
    ];
  },
});
