import React from 'react';
import { Settings, CheckCircle2, CalendarClock, Globe, Search } from 'lucide-react';

export default function SettingsPanel({ title, setTitle, slug, setSlug, description, setDescription, visible, onClose }) {
  return <aside className={`settings-panel ${visible?'panel-visible':''}`}>
    <div className="settings-heading"><div><Settings size={18}/><h2>Cài đặt trang</h2></div><button className="panel-close" onClick={onClose}>×</button></div>
    <div className="settings-section"><label className="field-label">Tiêu đề trang <b>*</b></label><input className="field-input" value={title} onChange={e=>setTitle(e.target.value)}/><div className="helper-text">Tên trang sẽ hiển thị trên trình duyệt và kết quả tìm kiếm.</div></div>
    <div className="settings-section"><div className="label-with-action"><label className="field-label">Đường dẫn (Slug)</label><button className="text-action" onClick={()=>setSlug(title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''))}>Tự tạo</button></div><div className="slug-input"><span>cmsbuilder.vn/</span><input value={slug} onChange={e=>setSlug(e.target.value)}/></div><div className="helper-text">Đường dẫn thân thiện với công cụ tìm kiếm.</div></div>
    <div className="settings-section"><label className="field-label">Mô tả SEO (Meta Description)</label><textarea className="description-input" rows="5" value={description} onChange={e=>setDescription(e.target.value)}/><div className="char-count">{description.length}/160 ký tự</div></div>
    <div className="seo-preview"><div className="seo-label"><Search size={14}/> XEM TRƯỚC KẾT QUẢ TÌM KIẾM</div><strong>{title || 'Tiêu đề trang'}</strong><span>https://cmsbuilder.vn/{slug || 'duong-dan-trang'}</span><p>{description || 'Mô tả trang sẽ hiển thị tại đây...'}</p></div>
    <div className="settings-section publish-info"><div className="section-title"><CalendarClock size={16}/> Lịch sử bài viết <i/></div><div className="history-card"><CheckCircle2 size={17}/><div><strong>Đã lưu vào bộ nhớ nháp</strong><span>Cập nhật gần nhất: Vừa xong</span></div></div></div>
    <div className="visibility-row"><Globe size={16}/><span>Trạng thái hiển thị</span><strong><i/> Bản nháp</strong></div>
  </aside>;
}
