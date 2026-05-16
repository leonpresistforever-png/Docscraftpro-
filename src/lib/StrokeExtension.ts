import '@tiptap/extension-text-style';
import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    stroke: {
      setStrokeColor: (color: string) => ReturnType;
      setStrokeWidth: (width: string) => ReturnType;
      unsetStroke: () => ReturnType;
    }
  }
}

export const StrokeExtension = Extension.create({
  name: 'stroke',
  addOptions() {
    return {
      types: ['textStyle'],
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          strokeColor: {
            default: null,
            parseHTML: element => element.style.webkitTextStrokeColor || null,
            renderHTML: attributes => {
              if (!attributes.strokeColor) return {};
              return {
                style: `-webkit-text-stroke-color: ${attributes.strokeColor};`
              }
            },
          },
          strokeWidth: {
            default: null,
            parseHTML: element => element.style.webkitTextStrokeWidth || null,
            renderHTML: attributes => {
              if (!attributes.strokeWidth) return {};
              return {
                style: `-webkit-text-stroke-width: ${attributes.strokeWidth}; paint-order: stroke fill;`,
              }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setStrokeColor: strokeColor => ({ chain }) => {
        return chain().setMark('textStyle', { strokeColor }).run();
      },
      setStrokeWidth: strokeWidth => ({ chain }) => {
        return chain().setMark('textStyle', { strokeWidth }).run();
      },
      unsetStroke: () => ({ chain }) => {
        return chain().setMark('textStyle', { strokeColor: null, strokeWidth: null }).run();
      },
    }
  },
});
