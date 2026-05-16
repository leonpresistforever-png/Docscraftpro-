import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    spacing: {
      setLineHeight: (spacing: string) => ReturnType;
      unsetSpacing: () => ReturnType;
    }
  }
}

export const SpacingExtension = Extension.create({
  name: 'spacing',
  addOptions() {
    return {
      types: ['paragraph', 'heading', 'listItem', 'taskItem'],
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: element => element.style.lineHeight?.replace(/['"]+/g, '') || null,
            renderHTML: attributes => {
              if (!attributes.lineHeight) {
                return {}
              }
              return {
                style: `line-height: ${attributes.lineHeight}`,
              }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setLineHeight: (lineHeight: string) => ({ commands }) => {
        let applied = false;
        this.options.types.forEach((type: string) => {
          const result = commands.updateAttributes(type, { lineHeight });
          if (result) applied = true;
        });
        return applied;
      },
      unsetSpacing: () => ({ commands }) => {
        let applied = false;
        this.options.types.forEach((type: string) => {
          const result = commands.resetAttributes(type, 'lineHeight');
          if (result) applied = true;
        });
        return applied;
      },
    }
  },
});
