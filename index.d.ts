import { ReactNode } from "react";

export interface RichTextProps {
  initValue?: string;
  onChange?: (html: string) => void;
  toolberSlot?: ReactNode;
  placeholder?: string;
  laodingElement?: ReactNode;
  imageAccept?: string;
  beforeImageUpload?: (file: File) => Promise<void>;
  videoAccept?: string;
  beforeVideoUpload?: (file: File) => Promise<void>;
  toolberConfig?: string[];
  style?: React.CSSProperties;
}

declare const RichText: React.FC<RichTextProps>;

export default RichText;
