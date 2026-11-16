import React from 'react';
import { Search, Bell, BookOpen, Menu, ChevronRight, Save, Eye, Send, SlidersHorizontal } from 'lucide-react';

export default function Topbar({ onMenu, onPreview, onSave, onPublish, onSettings }) {
  return <>
    <header className="global-header">
      <button className="icon-btn mobile-menu" onClick={onMenu}><Menu size={20}/></button>
      <div className="breadcrumb"><span>CMS Workspace</span><ChevronRight size={14}/><strong>Quản lý trang</strong></div>
      <div className="global-search"><Search size={16}/><input placeholder="Tìm kiếm trang, nội dung..." /></div>
      <button className="help-link"><BookOpen size={16}/> <span>Trung tâm trợ giúp</span></button>
      <button className="icon-btn notification"><Bell size={18}/><i /></button>
      <div className="profile"><div className="avatar">HN</div><div><strong>Hoàng Nam</strong><span>Admin · Hoạt động</span></div></div>
    </header>
    <header className="editor-header">
      <div className="page-heading"><div className="page-heading-title"><span className="back-arrow">‹</span><div><h1>Giới thiệu sản phẩm mới</h1><p>Trang / Giới thiệu sản phẩm mới · <span className="status-dot"/> Bản nháp</p></div></div></div>
      <div className="editor-actions">
        <button className="icon-btn settings-mobile" onClick={onSettings}><SlidersHorizontal size={17}/></button>
        <button className="outline-btn preview-btn" onClick={onPreview}><Eye size={16}/><span>Xem trước</span></button>
        <button className="outline-btn save-btn" onClick={onSave}><Save size={16}/><span>Lưu bản nháp</span></button>
        <button className="primary-btn publish-btn" onClick={onPublish}><Send size={15}/><span>Xuất bản ngay</span></button>
      </div>
    </header>
  </>;
}
