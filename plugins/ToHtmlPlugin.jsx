import { $getRoot } from "lexical";
import { $isRootTextContentEmpty } from "@lexical/text";
import { $generateHtmlFromNodes } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export default function ToHtmlPlugin({ onChange }) {
  const [editor] = useLexicalComposerContext();
  editor.registerUpdateListener(({ editorState }) => {
    editorState.read(() => {
      const root = $getRoot();
      const isTextEmpty = $isRootTextContentEmpty();
      const isEmpty =
        root.getFirstChild().isEmpty() && root.getChildrenSize() === 1;
      if (isEmpty && isTextEmpty) {
        onChange && onChange("");
      } else {
        const tmp = $generateHtmlFromNodes(editor);
        onChange && onChange(tmp);
      }
    });
  });
  return null;
}
