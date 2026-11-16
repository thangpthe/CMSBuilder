import React from 'react';
import { Blocks, FileText, FolderOpen, PanelsTopLeft, Settings, ChevronDown, PanelLeftClose } from 'lucide-react';

const items = [
  { icon: FileText, label: 'Quản lý trang', active: true },
  { icon: Blocks, label: 'Trình soạn thảo' },
  { icon: FolderOpen, label: 'Thư viện Media' },
  { icon: PanelsTopLeft, label: 'Trang công khai' },
  { icon: Settings, label: 'Cài đặt hệ thống' }
];

export default function Sidebar({ open, onClose }) {
  return <>
    <div className={`sidebar-backdrop ${open ? 'show' : ''}`} onClick={onClose} />
    <aside className={`sidebar ${open ? 'mobile-open' : ''}`}>
      <div className="brand-row"><div className="brand-mark">C</div><span>CMSBuilder</span><button className="icon-btn sidebar-close" onClick={onClose}><PanelLeftClose size={18}/></button></div>
      <div className="nav-caption">QUẢN TRỊ HỆ THỐNG</div>
      <nav>{items.map(({icon: Icon, label, active}) => <button key={label} className={`nav-item ${active ? 'active' : ''}`}><Icon size={18}/><span>{label}</span></button>)}</nav>
      <div className="workspace-card"><div className="workspace-icon"><Blocks size={17}/></div><div><strong>CMS Workspace</strong><span>Gói miễn phí · Đã sử dụng</span><div className="usage"><i /></div><small>85 / 100 lượt sử dụng</small></div><ChevronDown size={15}/></div>
    </aside>
  </>;
}
