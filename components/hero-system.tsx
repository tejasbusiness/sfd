import type { CSSProperties } from 'react';
import { Monitor, UserPlus, Search, Database, MessageCircle, Sparkles } from 'lucide-react';

const NODES = [
  { label: 'Website', Icon: Monitor, top: '6%', left: '10%', color: '#38BDF8' },
  { label: 'Lead', Icon: UserPlus, top: '24%', left: '52%', color: '#34D399' },
  { label: 'Search', Icon: Search, top: '10%', left: '86%', color: '#FBBF24' },
  { label: 'CRM', Icon: Database, top: '50%', left: '58%', color: '#F472B6' },
  { label: 'WhatsApp', Icon: MessageCircle, top: '68%', left: '20%', color: '#25D366' },
  { label: 'AI', Icon: Sparkles, top: '90%', left: '64%', color: '#A78BFA' },
];

export default function HeroSystem() {
  return (
    <div className="hero-system" aria-hidden="true">
      <svg className="hero-system-lines" viewBox="0 0 400 460" preserveAspectRatio="none" fill="none">
        <path
          d="M40,28 L208,110 L344,40 L232,230 L80,313 L256,414"
          stroke="url(#hero-line)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="hero-line" x1="0" y1="0" x2="400" y2="460" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#7C3AED" stopOpacity=".05" />
            <stop offset=".5" stopColor="#A78BFA" stopOpacity=".55" />
            <stop offset="1" stopColor="#7C3AED" stopOpacity=".05" />
          </linearGradient>
        </defs>
      </svg>
      {NODES.map((n, i) => (
        <div className="hero-node" key={n.label} style={{ top: n.top, left: n.left, animationDelay: `${i * -0.9}s`, '--node-color': n.color } as CSSProperties}>
          <n.Icon size={14} strokeWidth={1.6} />
          <span>{n.label}</span>
        </div>
      ))}
    </div>
  );
}
