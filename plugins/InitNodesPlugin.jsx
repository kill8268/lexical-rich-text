import { $getRoot, $getSelection } from "lexical";
import { $generateNodesFromDOM } from "@lexical/html";
import { $isRootTextContentEmpty } from "@lexical/text";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

export default function InitNodesPlugin({ html }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!html || !editor) {
      return;
    }
    editor.update(() => {
      const root = $getRoot();
      const isTextEmpty = $isRootTextContentEmpty();
      const isEmpty =
        root.getFirstChild().isEmpty() && root.getChildrenSize() === 1;
      if (isEmpty && isTextEmpty) {
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);
        $getRoot().select();
        const selection = $getSelection();
        root.clear();
        selection.insertNodes(nodes);
      }
    });
  }, [editor, html]);
  return null;
}
