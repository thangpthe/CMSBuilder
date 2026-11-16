import React, { useMemo, useState } from 'react';
import { Check, Monitor, Smartphone, Tablet, X, ExternalLink } from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import BlockEditor from './components/BlockEditor.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import { initialBlocks } from './data/initialBlocks.js';

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2,7)}`;

export default function App() {
  const [blocks,setBlocks] = useState(initialBlocks);
  const [selectedId,setSelectedId] = useState(initialBlocks[0].id);
  const [title,setTitle] = useState('Giới thiệu sản phẩm mới | CMSBuilder');
  const [slug,setSlug] = useState('gioi-thieu-san-pham-moi');
  const [description,setDescription] = useState('Khám phá các tính năng đột phá của nền tảng CMSBuilder thông minh. Tối ưu hóa quy trình quản trị nội dung, nâng cao hiệu suất và trải nghiệm người dùng.');
  const [sidebarOpen,setSidebarOpen] = useState(false);
  const [settingsOpen,setSettingsOpen] = useState(false);
  const [toast,setToast] = useState('');
  const [preview,setPreview] = useState(false);
  const [previewSize,setPreviewSize] = useState('desktop');
  const selectedBlock = useMemo(()=>blocks.find(b=>b.id===selectedId),[blocks,selectedId]);

  const notify = (message) => { setToast(message); window.clearTimeout(window.__cmsToast); window.__cmsToast=window.setTimeout(()=>setToast(''),2600); };
  const updateBlock = (id,changes) => setBlocks(old=>old.map(b=>b.id===id?{...b,...changes}:b));
  const deleteBlock = id => { setBlocks(old=>old.filter(b=>b.id!==id)); if(selectedId===id) setSelectedId(blocks.find(b=>b.id!==id)?.id || ''); notify('Đã xóa khối nội dung'); };
  const moveBlock = (index,direction) => setBlocks(old=>{const next=[...old]; const target=index+direction; if(target<0||target>=next.length)return old; [next[index],next[target]]=[next[target],next[index]]; return next;});
  const duplicateBlock = block => {const copy={...block,id:makeId(),label:`${block.label} (bản sao)`}; setBlocks(old=>{const i=old.findIndex(b=>b.id===block.id);const next=[...old];next.splice(i+1,0,copy);return next;});setSelectedId(copy.id);notify('Đã nhân bản khối nội dung');};
  const addBlock = type => {const common={id:makeId(),type,label:type==='text'?'Văn bản':type==='image'?'Hình ảnh':'Video'};const block=type==='text'?{...common,content:'Nhập tiêu đề của bạn tại đây',body:'Bắt đầu viết nội dung của bạn...',level:'h2'}:type==='image'?{...common,src:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=85',alt:'Hình ảnh minh họa',caption:'Thêm chú thích cho hình ảnh'}:{...common,url:'https://www.youtube.com/watch?v=ysz5S6PUM-U',title:'Video mới'};setBlocks(old=>[...old,block]);setSelectedId(block.id);notify('Đã thêm khối nội dung mới');};
  const save = () => { localStorage.setItem('cmsbuilder-page-draft',JSON.stringify({blocks,title,slug,description})); notify('Đã lưu bản nháp trên thiết bị này'); };
  const publish = () => { save(); notify('Bản nháp đã sẵn sàng — cần kết nối API để xuất bản'); };

  return <div className="app-shell">
    <Sidebar open={sidebarOpen} onClose={()=>setSidebarOpen(false)}/>
    <div className="main-area"><Topbar onMenu={()=>setSidebarOpen(true)} onPreview={()=>setPreview(true)} onSave={save} onPublish={publish} onSettings={()=>setSettingsOpen(v=>!v)}/>
      <div className="workspace"><div className="editor-toolbar"><div className="toolbar-left"><span className="toolbar-label">Chỉnh sửa nội dung</span><span className="toolbar-divider"/><button className="tool-tab active">T · Văn bản</button><button className="tool-tab" onClick={()=>addBlock('image')}>▧ Tải lên ảnh</button><button className="tool-tab" onClick={()=>addBlock('video')}>▣ Nội dung Video</button></div><div className="toolbar-right"><button className="mobile-settings-link" onClick={()=>setSettingsOpen(v=>!v)}>Cài đặt</button><span>{blocks.length} blocks</span></div></div>
        <div className="editor-layout"><BlockEditor blocks={blocks} onUpdate={updateBlock} onDelete={deleteBlock} onMove={moveBlock} onDuplicate={duplicateBlock} onAdd={addBlock} selectedId={selectedId} setSelectedId={setSelectedId}/><SettingsPanel title={title} setTitle={setTitle} slug={slug} setSlug={setSlug} description={description} setDescription={setDescription} visible={settingsOpen} onClose={()=>setSettingsOpen(false)}/></div>
      </div>
    </div>
    {toast && <div className="toast"><Check size={16}/>{toast}</div>}
    {preview && <div className="preview-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setPreview(false)}}><div className={`preview-modal ${previewSize}`}><div className="preview-modal-header"><div><strong>Xem trước trang</strong><span>Kiểm tra giao diện trước khi xuất bản</span></div><div className="preview-device-controls"><button className={previewSize==='desktop'?'active':''} onClick={()=>setPreviewSize('desktop')}><Monitor size={17}/></button><button className={previewSize==='tablet'?'active':''} onClick={()=>setPreviewSize('tablet')}><Tablet size={17}/></button><button className={previewSize==='mobile'?'active':''} onClick={()=>setPreviewSize('mobile')}><Smartphone size={17}/></button><button className="close-preview" onClick={()=>setPreview(false)}><X size={18}/></button></div></div><div className="preview-viewport"><article className="preview-page"><div className="preview-site-nav"><b>CMS<span>Builder</span></b><span>Trang chủ　 Giới thiệu　 Sản phẩm　 Liên hệ</span></div>{blocks.map(b=><div className="preview-content" key={b.id}>{b.type==='text'?<><h1>{b.content}</h1><p>{b.body}</p></>:b.type==='image'?<><img src={b.src} alt={b.alt}/><small>{b.caption}</small></>:<div className="preview-video"><div className="play-button">▶</div><p>{b.title}</p></div>}</div>)}<footer>© 2026 CMSBuilder. All rights reserved.</footer></article></div><div className="preview-footer"><span><ExternalLink size={14}/> Bản xem trước · Chưa công khai</span><button className="primary-btn" onClick={()=>{setPreview(false);publish()}}>Xuất bản trang</button></div></div></div>}
  </div>;
}
