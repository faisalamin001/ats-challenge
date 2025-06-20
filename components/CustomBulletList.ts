// components/CustomBulletList.ts
import BulletList from '@tiptap/extension-bullet-list';
import { mergeAttributes } from '@tiptap/core';

export const CustomBulletList = BulletList.extend({
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
    return ['ul', mergeAttributes(HTMLAttributes), 0];
  },
});
