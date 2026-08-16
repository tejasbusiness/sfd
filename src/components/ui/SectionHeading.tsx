import Reveal from '../motion/Reveal'

interface SectionHeadingProps {
  eyebrow: string
  title: string
  align?: 'left' | 'center'
  variant?: 'editorial' | 'clinical'
}

/**
 * variant="clinical" opts into the public-site "Studio Neutral" type system
 * (Inter, ink/faint tokens) without changing the default editorial
 * (Fraunces/ink) styling used by every other page that renders this
 * component.
 */
function SectionHeading({ eyebrow, title, align = 'center', variant = 'editorial' }: SectionHeadingProps) {
  const isClinical = variant === 'clinical'
  const wrapperClass = align === 'center' ? 'text-center' : 'text-left'
  const eyebrowClass = isClinical
    ? 'font-mono-label flex items-center gap-2 text-xs text-studio-ink-faint' +
      (align === 'center' ? ' justify-center' : '')
    : 'font-mono-label text-xs uppercase text-teal'
  const titleClass = isClinical
    ? 'mt-2 text-3xl font-bold leading-tight tracking-[-0.02em] text-studio-ink sm:text-4xl'
    : 'font-display mt-2 text-3xl font-light leading-tight text-ink sm:text-4xl'

  return (
    <div className={wrapperClass}>
      <Reveal variant="mask">
        <p className={eyebrowClass}>
          {isClinical && <span className="h-[2px] w-5 bg-studio-ink-faint" />}
          {eyebrow}
        </p>
      </Reveal>
      <Reveal variant="mask" delay={0.08}>
        <h2 className={titleClass}>{title}</h2>
      </Reveal>
    </div>
  )
}

export default SectionHeading
