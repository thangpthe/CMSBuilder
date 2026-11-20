import type { Block } from '../../../types/pageBuilder';

export const initialBlocks: Block[] = [
  {
    id: 'text-1',
    type: 'text',
    label: 'Văn bản',
    content: '',
    body: '',
    level: 'h1',
  },
  {
    id: 'image-1',
    type: 'image',
    label: 'Hình ảnh',
    src: '',
    alt: '',
    caption: '',
  },
  {
    id: 'video-1',
    type: 'video',
    label: 'Video',
    url: '',
    title: 'Video giới thiệu nền tảng CMSBuilder',
  },
];
