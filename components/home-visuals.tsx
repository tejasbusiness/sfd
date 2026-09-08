const SERVICE_VISUALS: Record<string, () => React.ReactNode> = {
  'web-design': () => (
    <div className="visual-browser">
      <div className="visual-browser-bar"><span /><span /><span /><i /></div>
      <div className="visual-browser-body">
        <div className="vb-hero" />
        <div className="vb-row"><div className="vb-block" /><div className="vb-block" /><div className="vb-block" /></div>
      </div>
    </div>
  ),
  'local-seo': () => (
    <div className="visual-map">
      <div className="visual-map-grid" />
      <span className="visual-pin" style={{ top: '28%', left: '66%' }} />
      <span className="visual-pin" style={{ top: '62%', left: '30%' }} />
      <span className="visual-pin visual-pin-main" style={{ top: '46%', left: '46%' }} />
    </div>
  ),
  'ai-automation': () => (
    <div className="visual-flow">
      <span className="visual-flow-node" />
      <span className="visual-flow-line" />
      <span className="visual-flow-node" />
      <span className="visual-flow-line" />
      <span className="visual-flow-node visual-flow-node-active" />
    </div>
  ),
  'website-consultation': () => (
    <div className="visual-checklist">
      <div className="visual-check-row visual-check-done" />
      <div className="visual-check-row visual-check-done" />
      <div className="visual-check-row" />
    </div>
  ),
  'social-media-marketing': () => (
    <div className="visual-cards">
      <span className="visual-mini-card" />
      <span className="visual-mini-card" />
      <span className="visual-mini-card" />
    </div>
  ),
  'whatsapp-business-api': () => (
    <div className="visual-chat">
      <span className="visual-bubble visual-bubble-in" />
      <span className="visual-bubble visual-bubble-out" />
      <span className="visual-bubble visual-bubble-in visual-bubble-short" />
    </div>
  ),
};

export function ServiceVisual({ slug }: { slug: string }) {
  const render = SERVICE_VISUALS[slug];
  if (!render) return null;
  return <div className="service-visual" aria-hidden="true">{render()}</div>;
}

const TOOL_VISUALS: Record<string, () => React.ReactNode> = {
  'website-prompt-generator': () => (
    <div className="visual-prompt">
      <div className="visual-prompt-line" style={{ width: '82%' }} />
      <div className="visual-prompt-line" style={{ width: '64%' }} />
      <div className="visual-prompt-line" style={{ width: '72%' }} />
      <span className="visual-prompt-cta" />
    </div>
  ),
  'image-resizer': () => (
    <div className="visual-resize">
      <div className="visual-resize-frame">
        <span className="visual-resize-handle visual-resize-handle-tl" />
        <span className="visual-resize-handle visual-resize-handle-br" />
      </div>
      <span className="visual-resize-tag">1200 × 800</span>
    </div>
  ),
  'invoice-generator': () => (
    <div className="visual-invoice">
      <div className="visual-invoice-head" />
      <div className="visual-invoice-row" />
      <div className="visual-invoice-row" />
      <div className="visual-invoice-total" />
    </div>
  ),
};

export function ToolVisual({ slug }: { slug: string }) {
  const render = TOOL_VISUALS[slug];
  if (!render) return null;
  return <div className="tool-visual" aria-hidden="true">{render()}</div>;
}
