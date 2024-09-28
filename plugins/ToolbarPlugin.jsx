import { useState, useEffect, useCallback, useMemo } from "react";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { createPortal } from "react-dom";
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  INDENT_CONTENT_COMMAND,
  $getSelection,
  $isRangeSelection,
} from "lexical";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode,
} from "@lexical/list";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $getSelectionStyleValueForProperty } from "@lexical/selection";
import { $isHeadingNode } from "@lexical/rich-text";
import getSelectedNode from "../lib/getSelectedNode";
import FontDropDown from "../components/FontDropDown";
import FloatingLinkEditor from "../components/FloatingLinkEditor";
import { INSERT_IMAGE_COMMAND } from "./ImagesPlugin";
import { INSERT_VIDEO_COMMAND } from "./VideoPlugin";

const LowPriority = 1;
export default function ToolbarPlugin({
  toolberConfig,
  imageAccept,
  videoAccept,
  laodingElement,
  beforeImageUpload,
  beforeVideoUpload,
  slot,
}) {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [blockType, setBlockType] = useState("paragraph");
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [fontSize, setFontSize] = useState("14px");
  const [fontFamily, setFontFamily] = useState("SimSun");
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toolberConfigSet = useMemo(
    () => new Set(toolberConfig),
    [toolberConfig],
  );

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);
      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList ? parentList.getTag() : element.getTag();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          setBlockType(type);
        }
      }
      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
      setFontSize(
        $getSelectionStyleValueForProperty(selection, "font-size", "14px"),
      );
      setFontFamily(
        $getSelectionStyleValueForProperty(selection, "font-family", "SimSun"),
      );
    }
  }, [editor]);

  useEffect(
    () =>
      mergeRegister(
        editor.registerEditableListener(setIsEditable),
        editor.registerUpdateListener(({ editorState }) =>
          editorState.read(updateToolbar),
        ),
        editor.registerCommand(
          SELECTION_CHANGE_COMMAND,
          (_payload, _) => {
            updateToolbar();
            return false;
          },
          LowPriority,
        ),
        editor.registerCommand(
          CAN_UNDO_COMMAND,
          (payload) => {
            setCanUndo(payload);
            return false;
          },
          LowPriority,
        ),
        editor.registerCommand(
          CAN_REDO_COMMAND,
          (payload) => {
            setCanRedo(payload);
            return false;
          },
          LowPriority,
        ),
      ),
    [editor, updateToolbar],
  );

  const shouldShowDivider = (buttons) => {
    return buttons.some((button) => toolberConfigSet.has(button));
  };

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  const formatBulletList = () => {
    if (blockType !== "ul") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== "ol") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND);
    }
  };

  const uploadImage = () => {
    if (!beforeImageUpload) return;
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = imageAccept || "image/*";
    fileInput.onchange = async (e) => {
      setIsLoading(true);
      try {
        const { files } = e.target;
        const src = await beforeImageUpload(files);
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
          src,
          width: "100%",
          maxWidth: "100%",
        });
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fileInput.click();
  };

  const uploadVideo = () => {
    if (!beforeVideoUpload) return;
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = videoAccept || "video/*";
    fileInput.onchange = async (e) => {
      setIsLoading(true);
      try {
        const { files } = e.target;
        const src = await beforeVideoUpload(files);
        editor.dispatchCommand(INSERT_VIDEO_COMMAND, {
          src,
          width: "100%",
          maxWidth: "100%",
        });
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fileInput.click();
  };

  return (
    <div className="toolbar">
      {isLoading && laodingElement}
      {toolberConfigSet.has("Undo") && (
        <button
          type="button"
          disabled={!canUndo}
          onClick={() => editor.dispatchCommand(UNDO_COMMAND)}
          className="toolbar-item spaced"
          aria-label="Undo"
        >
          <i className="format undo" />
        </button>
      )}
      {toolberConfigSet.has("Redo") && (
        <button
          type="button"
          disabled={!canRedo}
          onClick={() => editor.dispatchCommand(REDO_COMMAND)}
          className="toolbar-item"
          aria-label="Redo"
        >
          <i className="format redo" />
        </button>
      )}
      {shouldShowDivider(["Undo", "Redo"]) && <div className="divider" />}
      {toolberConfigSet.has("font family") && (
        <FontDropDown
          disabled={!isEditable}
          style={"font-family"}
          value={fontFamily}
          editor={editor}
        />
      )}
      {shouldShowDivider(["font family"]) && <div className="divider" />}
      {toolberConfigSet.has("font size") && (
        <FontDropDown
          disabled={!isEditable}
          style={"font-size"}
          value={fontSize}
          editor={editor}
        />
      )}
      {shouldShowDivider(["font size"]) && <div className="divider" />}
      {toolberConfigSet.has("Format Bold") && (
        <button
          type="button"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
          className={`toolbar-item spaced ${isBold ? "active" : ""}`}
          aria-label="Format Bold"
        >
          <i className="format bold" />
        </button>
      )}
      {toolberConfigSet.has("Format Italics") && (
        <button
          type="button"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
          className={`toolbar-item spaced ${isItalic ? "active" : ""}`}
          aria-label="Format Italics"
        >
          <i className="format italic" />
        </button>
      )}
      {toolberConfigSet.has("underline") && (
        <button
          type="button"
          onClick={() =>
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")
          }
          className={`toolbar-item spaced ${isUnderline ? "active" : ""}`}
          aria-label="Format Underline"
        >
          <i className="format underline" />
        </button>
      )}
      {shouldShowDivider(["Format Bold", "Format Italics", "underline"]) && (
        <div className="divider" />
      )}
      {toolberConfigSet.has("Left Align") && (
        <button
          type="button"
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
          className="toolbar-item spaced"
          aria-label="Left Align"
        >
          <i className="format left-align" />
        </button>
      )}
      {toolberConfigSet.has("Center Align") && (
        <button
          type="button"
          onClick={() =>
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")
          }
          className="toolbar-item spaced"
          aria-label="Center Align"
        >
          <i className="format center-align" />
        </button>
      )}
      {toolberConfigSet.has("Right Align") && (
        <button
          type="button"
          onClick={() =>
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")
          }
          className="toolbar-item spaced"
          aria-label="Right Align"
        >
          <i className="format right-align" />
        </button>
      )}
      {shouldShowDivider(["Left Align", "Center Align", "Right Align"]) && (
        <div className="divider" />
      )}
      {toolberConfigSet.has("Format bullet-list") && (
        <button
          type="button"
          onClick={formatBulletList}
          className={`toolbar-item spaced ${
            blockType === "ul" ? "active" : ""
          }`}
          aria-label="Format bullet-list"
        >
          <i className="format bullet-list" />
        </button>
      )}
      {toolberConfigSet.has("Format numbered-list") && (
        <button
          type="button"
          onClick={formatNumberedList}
          className={`toolbar-item spaced ${
            blockType === "ol" ? "active" : ""
          }`}
          aria-label="Format numbered-list"
        >
          <i className="format numbered-list" />
        </button>
      )}
      {toolberConfigSet.has("Insert Link") && (
        <button
          type="button"
          onClick={insertLink}
          className={`toolbar-item spaced ${isLink ? "active" : ""}`}
          aria-label="Insert Link"
        >
          <i className="format link" />
        </button>
      )}
      {isLink &&
        toolberConfigSet.has("Insert Link") &&
        createPortal(<FloatingLinkEditor editor={editor} />, document.body)}
      {toolberConfigSet.has("Image") && (
        <button
          type="button"
          onClick={uploadImage}
          className="toolbar-item spaced"
          aria-label="Image"
        >
          <i className="format image" />
        </button>
      )}
      {toolberConfigSet.has("Video") && (
        <button
          type="button"
          onClick={uploadVideo}
          className="toolbar-item spaced"
          aria-label="Video"
        >
          <i className="format video" />
        </button>
      )}
      {shouldShowDivider([
        "Format bullet-list",
        "Format numbered-list",
        "Insert Link",
        "Image",
        "Video",
      ]) && <div className="divider" />}
      {toolberConfigSet.has("Format outdent") && (
        <button
          type="button"
          onClick={() =>
            editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)
          }
          className="toolbar-item spaced"
          aria-label="Format outdent"
        >
          <i className="format outdent" />
        </button>
      )}
      {toolberConfigSet.has("Format indent") && (
        <button
          type="button"
          onClick={() =>
            editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)
          }
          className="toolbar-item spaced"
          aria-label="Format indent"
        >
          <i className="format indent" />
        </button>
      )}
      <div className="flex-1 flex justify-end items-center">{slot}</div>
    </div>
  );
}
