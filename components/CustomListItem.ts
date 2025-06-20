// components/CustomListItem.ts
import ListItem from '@tiptap/extension-list-item';
import { mergeAttributes } from '@tiptap/core';

export const CustomListItem = ListItem.extend({
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
  renderHTML({ HTMLAttributes }) {
    return ['li', mergeAttributes(HTMLAttributes), 0];
  },
});
