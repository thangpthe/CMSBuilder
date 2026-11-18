/**
 * Crisp vector workspace illustration (SVG) so it renders razor-sharp on all DPIs
 * and scales cleanly with max-width: 100%; height: auto; display: block.
 */
export function WorkspaceHeroIllustration() {
  return (
    <svg
      viewBox="0 0 960 540"
      width="960"
      height="540"
      role="img"
      aria-label="Khung không gian thiết kế CMSBuilder 3 phân vùng"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="deskBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EEF2FF" />
          <stop offset="55%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#E0E7FF" />
        </linearGradient>
        <linearGradient id="screenAccent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>

      <rect width="960" height="540" fill="url(#deskBg)" />

      {/* Subtle ambient circles */}
      <circle cx="140" cy="110" r="90" fill="#C7D2FE" opacity="0.35" />
      <circle cx="840" cy="430" r="110" fill="#A5B4FC" opacity="0.3" />

      {/* Laptop / Studio Monitor Frame */}
      <rect x="96" y="48" width="768" height="444" rx="18" fill="#0F172A" />
      <rect x="112" y="64" width="736" height="412" rx="10" fill="#FFFFFF" />

      {/* Top Browser / App Bar */}
      <rect x="112" y="64" width="736" height="44" rx="10" fill="#F8FAFC" />
      <rect x="112" y="96" width="736" height="12" fill="#F8FAFC" />
      <line x1="112" y1="108" x2="848" y2="108" stroke="#E2E8F0" strokeWidth="1.5" />

      <circle cx="136" cy="86" r="5" fill="#EF4444" />
      <circle cx="154" cy="86" r="5" fill="#F59E0B" />
      <circle cx="172" cy="86" r="5" fill="#10B981" />

      <rect x="210" y="75" width="220" height="22" rx="6" fill="#EEF2FF" />
      <text x="224" y="90" fontSize="11" fontWeight="700" fill="#4F46E5" fontFamily="system-ui, sans-serif">
        CMSBuilder Studio v2.4
      </text>

      <rect x="740" y="74" width="90" height="24" rx="6" fill="url(#screenAccent)" />
      <text x="760" y="90" fontSize="11" fontWeight="600" fill="#FFFFFF" fontFamily="system-ui, sans-serif">
        Xuất bản
      </text>

      {/* Left Sidebar (Blocks) */}
      <rect x="112" y="108" width="164" height="368" fill="#F8FAFC" />
      <line x1="276" y1="108" x2="276" y2="476" stroke="#E2E8F0" strokeWidth="1.5" />
      <text x="130" y="136" fontSize="11" fontWeight="700" fill="#475569" fontFamily="system-ui, sans-serif">
        KHỐI NỘI DUNG
      </text>

      <rect x="128" y="152" width="132" height="38" rx="8" fill="#FFFFFF" stroke="#E2E8F0" />
      <rect x="140" y="164" width="14" height="14" rx="3" fill="#4F46E5" opacity="0.18" />
      <rect x="162" y="167" width="76" height="8" rx="4" fill="#334155" />

      <rect x="128" y="200" width="132" height="38" rx="8" fill="#EEF2FF" stroke="#4F46E5" strokeWidth="1.5" />
      <rect x="140" y="212" width="14" height="14" rx="3" fill="#4F46E5" />
      <rect x="162" y="215" width="80" height="8" rx="4" fill="#4F46E5" />

      <rect x="128" y="248" width="132" height="38" rx="8" fill="#FFFFFF" stroke="#E2E8F0" />
      <rect x="140" y="260" width="14" height="14" rx="3" fill="#10B981" opacity="0.2" />
      <rect x="162" y="263" width="68" height="8" rx="4" fill="#334155" />

      <rect x="128" y="296" width="132" height="38" rx="8" fill="#FFFFFF" stroke="#E2E8F0" />
      <rect x="140" y="308" width="14" height="14" rx="3" fill="#F59E0B" opacity="0.22" />
      <rect x="162" y="311" width="72" height="8" rx="4" fill="#334155" />

      {/* Center Canvas */}
      <rect x="298" y="128" width="356" height="328" rx="12" fill="#FFFFFF" stroke="#E2E8F0" />
      <rect x="318" y="148" width="88" height="20" rx="10" fill="#DCFCE7" />
      <text x="331" y="162" fontSize="10" fontWeight="700" fill="#166534" fontFamily="system-ui, sans-serif">
        Trang Công Khai
      </text>

      <rect x="318" y="182" width="260" height="16" rx="4" fill="#0F172A" />
      <rect x="318" y="206" width="200" height="10" rx="4" fill="#64748B" />

      {/* Hero card inside canvas */}
      <rect x="318" y="232" width="316" height="118" rx="10" fill="url(#screenAccent)" />
      <rect x="338" y="254" width="140" height="12" rx="4" fill="#FFFFFF" opacity="0.92" />
      <rect x="338" y="276" width="210" height="8" rx="4" fill="#FFFFFF" opacity="0.68" />
      <rect x="338" y="304" width="94" height="26" rx="6" fill="#6EE7B7" />

      {/* Bottom 2-col cards inside canvas */}
      <rect x="318" y="366" width="150" height="70" rx="8" fill="#F8FAFC" stroke="#E2E8F0" />
      <rect x="332" y="382" width="72" height="8" rx="4" fill="#334155" />
      <rect x="332" y="398" width="118" height="6" rx="3" fill="#94A3B8" />
      <rect x="332" y="410" width="96" height="6" rx="3" fill="#94A3B8" />

      <rect x="484" y="366" width="150" height="70" rx="8" fill="#F8FAFC" stroke="#E2E8F0" />
      <rect x="498" y="382" width="82" height="8" rx="4" fill="#334155" />
      <rect x="498" y="398" width="118" height="6" rx="3" fill="#94A3B8" />
      <rect x="498" y="410" width="92" height="6" rx="3" fill="#94A3B8" />

      {/* Right Inspector */}
      <rect x="676" y="108" width="172" height="368" fill="#F8FAFC" />
      <line x1="676" y1="108" x2="676" y2="476" stroke="#E2E8F0" strokeWidth="1.5" />
      <text x="694" y="136" fontSize="11" fontWeight="700" fill="#475569" fontFamily="system-ui, sans-serif">
        THUỘC TÍNH
      </text>

      <rect x="694" y="152" width="136" height="58" rx="8" fill="#FFFFFF" stroke="#E2E8F0" />
      <rect x="706" y="166" width="60" height="7" rx="3" fill="#64748B" />
      <rect x="706" y="182" width="110" height="16" rx="4" fill="#EEF2FF" />

      <rect x="694" y="224" width="136" height="96" rx="8" fill="#FFFFFF" stroke="#E2E8F0" />
      <rect x="706" y="240" width="84" height="7" rx="3" fill="#64748B" />
      <rect x="706" y="258" width="32" height="20" rx="4" fill="#4F46E5" />
      <rect x="746" y="258" width="32" height="20" rx="4" fill="#10B981" />
      <rect x="786" y="258" width="32" height="20" rx="4" fill="#F59E0B" />
      <rect x="706" y="290" width="110" height="14" rx="4" fill="#F1F5F9" />
    </svg>
  );
}

interface VideoPreviewPosterProps {
  isPlaying: boolean;
}

/**
 * Crisp 16:9 Video Preview Frame SVG.
 */
export function VideoPreviewPoster({ isPlaying }: VideoPreviewPosterProps) {
  return (
    <svg
      viewBox="0 0 960 540"
      width="960"
      height="540"
      role="img"
      aria-label="Xem trước trình biên tập trực quan CMSBuilder"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="vidBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1E1B4B" />
          <stop offset="55%" stopColor="#312E81" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
      </defs>

      <rect width="960" height="540" fill="url(#vidBg)" />

      {/* Decorative editor cards */}
      <rect x="80" y="64" width="800" height="390" rx="14" fill="#0F172A" stroke="#334155" strokeWidth="2" />
      <rect x="104" y="88" width="210" height="342" rx="10" fill="#1E293B" />
      <rect x="122" y="110" width="110" height="12" rx="4" fill="#818CF8" />
      <rect x="122" y="138" width="174" height="48" rx="8" fill="#334155" />
      <rect x="122" y="198" width="174" height="48" rx="8" fill="#4F46E5" opacity="0.45" />
      <rect x="122" y="258" width="174" height="48" rx="8" fill="#334155" />

      <rect x="334" y="88" width="522" height="342" rx="10" fill="#1E293B" />
      <rect x="360" y="116" width="240" height="16" rx="5" fill="#F8FAFC" opacity="0.9" />
      <rect x="360" y="144" width="468" height="130" rx="10" fill="#4F46E5" opacity="0.28" stroke="#6366F1" strokeWidth="1.5" />
      <rect x="380" y="168" width="180" height="14" rx="4" fill="#C7D2FE" />
      <rect x="380" y="192" width="320" height="10" rx="4" fill="#94A3B8" />
      <rect x="380" y="216" width="110" height="32" rx="6" fill="#34D399" />

      <rect x="360" y="294" width="224" height="110" rx="8" fill="#0F172A" stroke="#334155" />
      <rect x="604" y="294" width="224" height="110" rx="8" fill="#0F172A" stroke="#334155" />

      {isPlaying && (
        <g>
          <rect x="32" y="24" width="96" height="28" rx="14" fill="#EF4444" />
          <circle cx="50" cy="38" r="5" fill="#FFFFFF" />
          <text x="62" y="42" fontSize="12" fontWeight="700" fill="#FFFFFF" fontFamily="system-ui, sans-serif">
            ĐANG PHÁT
          </text>
        </g>
      )}
    </svg>
  );
}
