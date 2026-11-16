import React from 'react';
import { AlignLeft, Image as ImageIcon, Video, Plus, GripVertical, Trash2, Copy, ChevronUp, ChevronDown, Link2, MoreHorizontal } from 'lucide-react';

function BlockToolbar({ block, index, total, onMove, onDelete, onDuplicate }) {
  const Icon = block.type === 'text' ? AlignLeft : block.type === 'image' ? ImageIcon : Video;
  return <div className="block-toolbar"><div className="block-type"><GripVertical size={15}/><Icon size={15}/><span>{block.label}</span></div><div className="block-tools"><button title="Di chuyển lên" disabled={index===0} onClick={()=>onMove(index,-1)}><ChevronUp size={15}/></button><button title="Di chuyển xuống" disabled={index===total-1} onClick={()=>onMove(index,1)}><ChevronDown size={15}/></button><button title="Nhân bản" onClick={()=>onDuplicate(block)}><Copy size={14}/></button><button title="Xóa block" onClick={()=>onDelete(block.id)}><Trash2 size={14}/></button><button title="Thêm tùy chọn"><MoreHorizontal size={16}/></button></div></div>;
}

function BlockContent({ block, onUpdate }) {
  if (block.type === 'text') return <div className="text-block-content">
    <div className="format-toolbar"><button onClick={()=>onUpdate(block.id,{level:'h1'})} className={block.level==='h1'?'selected':''}>H1</button><button onClick={()=>onUpdate(block.id,{level:'h2'})} className={block.level==='h2'?'selected':''}>H2</button><button onClick={()=>onUpdate(block.id,{level:'p'})} className={block.level==='p'?'selected':''}>¶</button><span className="format-divider"/><button><b>B</b></button><button><i>I</i></button><button><u>U</u></button><button>≡</button><button>☷</button></div>
    {block.level === 'h1' ? <textarea className="heading-input" rows="2" value={block.content} onChange={e=>onUpdate(block.id,{content:e.target.value})} /> : block.level === 'h2' ? <textarea className="subheading-input" rows="2" value={block.content} onChange={e=>onUpdate(block.id,{content:e.target.value})}/> : <textarea className="paragraph-input" rows="2" value={block.content} onChange={e=>onUpdate(block.id,{content:e.target.value})}/>}
    <textarea className="body-input" rows="3" value={block.body} onChange={e=>onUpdate(block.id,{body:e.target.value})}/>
  </div>;
  if (block.type === 'image') return <div className="media-block-content"><div className="media-preview"><img src={block.src} alt={block.alt}/><div className="media-overlay">Ảnh xem trước</div></div><label className="field-label">Văn bản thay thế (Alt text)</label><input className="field-input" value={block.alt} onChange={e=>onUpdate(block.id,{alt:e.target.value})}/><label className="field-label">Chú thích ảnh</label><input className="field-input" value={block.caption} onChange={e=>onUpdate(block.id,{caption:e.target.value})}/></div>;
  return <div className="media-block-content"><label className="field-label">Đường dẫn video (YouTube / Vimeo)</label><div className="url-input"><Link2 size={15}/><input value={block.url} onChange={e=>onUpdate(block.id,{url:e.target.value})}/><span className="valid-tag">URL hợp lệ</span></div><div className="video-preview"><div className="video-screen"><div className="video-brand">CMS<span>BUILDER</span></div><div className="play-button">▶</div><p>{block.title}</p></div><div className="video-controls"><span>▶</span><div className="video-progress"><i/></div><span>0:24 / 2:15</span><span>⛶</span></div></div></div>;
}

export default function BlockEditor({ blocks, onUpdate, onDelete, onMove, onDuplicate, onAdd, selectedId, setSelectedId }) {
  return <main className="canvas-column">
    <div className="canvas-topline"><div><span className="eyebrow">ELEMENT PIPELINE</span><span className="pipeline-separator">·</span><span className="eyebrow">{blocks.length} KHỐI NỘI DUNG</span></div><span className="autosave"><i/> Tự động đồng bộ</span></div>
    <div className="page-canvas">
      {blocks.map((block,index)=><section key={block.id} className={`content-block ${selectedId===block.id?'is-selected':''}`} onClick={()=>setSelectedId(block.id)}>
        <BlockToolbar block={block} index={index} total={blocks.length} onMove={onMove} onDelete={onDelete} onDuplicate={onDuplicate}/>
        <BlockContent block={block} onUpdate={onUpdate}/>
      </section>)}
      <div className="add-block-area"><div className="add-block-plus"><Plus size={19}/></div><strong>+ Nhấn để chèn thêm khối nội dung mới</strong><span>Hãy tạo văn bản, hình ảnh, video hoặc các thành phần tương tác khác</span><div className="add-block-buttons"><button onClick={()=>onAdd('text')}><AlignLeft size={15}/> Văn bản</button><button onClick={()=>onAdd('image')}><ImageIcon size={15}/> Hình ảnh</button><button onClick={()=>onAdd('video')}><Video size={15}/> Video</button></div></div>
    </div>
  </main>;
}
