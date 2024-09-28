import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import ImagesPlugin from "./plugins/ImagesPlugin";
import VideoPlugin from "./plugins/VideoPlugin";
import ToHtmlPlugin from "./plugins/ToHtmlPlugin";
import InitNodesPlugin from "./plugins/InitNodesPlugin";
import { defaultToolberConfig, lexicalConfig } from "./config";
import "./index.css";
/**
 * RichText 组件，用于创建富文本编辑器。
 *
 * @param {Object} props 组件的 props。
 * @param {string} props.value 初始化编辑器的 HTML 内容。
 * @param {Function} props.onChange 当编辑器的内容发生变化时的回调函数。
 * @param {ReactNode} props.toolberSlot 工具栏的插槽，可以用来添加自定义的工具按钮。
 * @param {string} props.placeholder 编辑器的占位符。
 * @param {ReactNode} props.laodingElement 加载中的元素。
 * @param {string} props.imageAccept 可接受的图片文件类型。
 * @param {Function} props.beforeImageUpload 图片上传前的回调函数。
 * @param {string} props.videoAccept 可接受的视频文件类型。
 * @param {Function} props.beforeVideoUpload 视频上传前的回调函数。
 * @param {Array<string>} props.toolberConfig 工具栏配置，用于决定哪些工具按钮应该被显示。
 * @param {Object} props.style 编辑器的样式对象。
 *
 * @returns {ReactNode} 返回一个富文本编辑器组件。
 */
export default function RichText({
  initValue,
  onChange,
  toolberSlot,
  placeholder,
  laodingElement,
  imageAccept = "image/*",
  beforeImageUpload,
  videoAccept = "video/*",
  beforeVideoUpload,
  toolberConfig,
  style,
}) {
  return (
    <LexicalComposer initialConfig={lexicalConfig}>
      <div
        className="editor-container [transform:scale(1)] overflow-auto"
        style={style}
      >
        <ToolbarPlugin
          toolberConfig={toolberConfig || defaultToolberConfig}
          imageAccept={imageAccept}
          beforeImageUpload={beforeImageUpload}
          videoAccept={videoAccept}
          beforeVideoUpload={beforeVideoUpload}
          laodingElement={
            laodingElement && (
              <div className="fixed w-full h-full z-20 flex justify-center items-center bg-[rgba(255,255,255,0.5)]">
                加载中...
              </div>
            )
          }
          slot={toolberSlot}
        />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={
              <div className="editor-placeholder">{placeholder}</div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <LinkPlugin />
          <ListPlugin />
          <ImagesPlugin />
          <VideoPlugin />
        </div>
      </div>
      <InitNodesPlugin html={initValue} />
      <ToHtmlPlugin onChange={onChange} />
    </LexicalComposer>
  );
}
