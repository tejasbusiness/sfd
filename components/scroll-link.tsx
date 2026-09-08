'use client';
import type { ReactNode } from 'react';

export default function ScrollLink({ targetId, className, ariaLabel, children }: { targetId: string; className?: string; ariaLabel?: string; children: ReactNode }) {
  function handleClick() {
    const el = document.getElementById(targetId);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }
  return <button type="button" className={className} aria-label={ariaLabel} onClick={handleClick}>{children}</button>;
}
