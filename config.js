import { ListItemNode, ListNode } from "@lexical/list";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ImageNode } from "./nodes/ImageNode";
import { VideoNode } from "./nodes/VideoNode";
import theme from "./theme";

export const lexicalConfig = {
  editable: true,
  theme,
  onError(error) {
    throw error;
  },
  nodes: [
    LinkNode,
    ListNode,
    ListItemNode,
    AutoLinkNode,
    LinkNode,
    ImageNode,
    VideoNode,
  ],
};

export const FONT_FAMILY_OPTIONS = [
  ["SimSun", "宋体"], // 中文宋体
  ["Microsoft YaHei", "微软雅黑"], // 微软雅黑
  ["KaiTi", "楷体"], // 楷体
  ["LiSu", "隶书"], // 隶书
  ["FangSong", "仿宋"], // 仿宋
];

export const FONT_SIZE_OPTIONS = [
  ["8px", "8"],
  ["9px", "9"],
  ["10px", "10"],
  ["11px", "11"],
  ["12px", "12"],
  ["14px", "14"],
  ["16px", "16"],
  ["18px", "18"],
  ["20px", "20"],
  ["24px", "24"],
  ["32px", "32"],
  ["48px", "48"],
  ["72px", "72"],
];

export const defaultToolberConfig = [
  "Undo",
  "Redo",
  "font family",
  "font size",
  "Format Bold",
  "Format Italics",
  "underline",
  "Left Align",
  "Center Align",
  "Right Align",
  "Format bullet-list",
  "Format numbered-list",
  "Insert Link",
  "Image",
  "Video",
  "Format outdent",
  "Format indent",
];
