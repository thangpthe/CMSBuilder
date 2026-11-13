// PageStatsCards – 4 summary cards (total / published / draft / weekly views).

import React from 'react';
import { FiLayers, FiGlobe, FiEdit3, FiTrendingUp } from 'react-icons/fi';
import type { PageStats } from '../types/page.types';
import { COLORS } from './PageTableRow';

export interface PageStatsCardsProps {
  stats: PageStats | null;
  loading?: boolean;
  compact?: boolean;
}

interface CardDef {
  key: keyof PageStats;
  label: string;
  suffix: string;
  icon: React.ReactNode;
  accent: string;
  accentBg: string;
}

const CARDS: CardDef[] = [
  { key: 'totalPages', label: 'Tổng số trang', suffix: 'trang nội dung', icon: <FiLayers size={18} />, accent: COLORS.primary, accentBg: COLORS.primarySoft },
  { key: 'publishedPages', label: 'Đã xuất bản', suffix: 'trang công khai', icon: <FiGlobe size={18} />, accent: COLORS.published, accentBg: COLORS.publishedBg },
  { key: 'draftPages', label: 'Bản nháp', suffix: 'đang tinh chỉnh', icon: <FiEdit3 size={18} />, accent: COLORS.draft, accentBg: COLORS.draftBg },
  { key: 'weeklyViews', label: 'Lượt xem tuần này', suffix: '', icon: <FiTrendingUp size={18} />, accent: COLORS.primary, accentBg: COLORS.primarySoft },
];

const formatNumber = (n: number, compact?: boolean) =>
  compact && n >= 1000
    ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
    : n.toLocaleString('en-US');

export const PageStatsCards: React.FC<PageStatsCardsProps> = ({ stats, loading, compact }) => (
  <div
    data-testid="page-stats"
    style={{
      display: 'grid',
      gridTemplateColumns: compact ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))',
      gap: compact ? 10 : 16,
    }}
  >
    {CARDS.map((c) => (
      <div
        key={c.key}
        style={{
          background: '#fff',
          borderRadius: 14,
          padding: compact ? 12 : 16,
          border: `1px solid ${COLORS.border}`,
          borderBottom: `3px solid ${c.accentBg}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: COLORS.muted,
              textTransform: compact ? 'none' : 'uppercase',
              letterSpacing: compact ? 0 : 0.5,
            }}
          >
            {c.label}
          </span>
          <span
            aria-hidden
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: c.accentBg,
              color: c.accent,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {c.icon}
          </span>
        </div>
        <div style={{ marginTop: compact ? 6 : 10, display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span
            style={{
              fontSize: compact ? 22 : 28,
              fontWeight: 700,
              color: COLORS.text,
              fontFeatureSettings: '"tnum"',
            }}
          >
            {loading || !stats ? '—' : formatNumber(stats[c.key], compact)}
          </span>
          {c.suffix && !compact && (
            <span style={{ fontSize: 12, color: COLORS.muted }}>{c.suffix}</span>
          )}
        </div>
      </div>
    ))}
  </div>
);

export default PageStatsCards;
