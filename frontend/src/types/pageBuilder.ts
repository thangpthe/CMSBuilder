export type BlockType = 'text' | 'image' | 'video';

export type TextHeadingLevel = 'h1' | 'h2' | 'h3' | 'p';

export type PreviewSize = 'desktop' | 'tablet' | 'mobile';

export interface BaseBlock {
  id: string;
  backendId?: number;
  type: BlockType;
  label: string;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string;
  body: string;
  level: TextHeadingLevel;
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  src: string;
  alt: string;
  caption: string;
  mediaId?: number | null;
}

export interface VideoBlock extends BaseBlock {
  type: 'video';
  url: string;
  title: string;
}

export type Block = TextBlock | ImageBlock | VideoBlock;

export interface PageMetadata {
  title: string;
  slug: string;
  description: string;
  updatedAt?: string;
  status?: 'draft' | 'published';
}

export interface PageDraft extends PageMetadata {
  blocks: Block[];
}
