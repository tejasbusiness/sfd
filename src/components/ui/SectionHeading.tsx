import Reveal from '../motion/Reveal'

interface SectionHeadingProps {
  eyebrow: string
  title: string
  align?: 'left' | 'center'
  variant?: 'editorial' | 'clinical' | 'supahub'
}

/**
 * variant="clinical" opts into the public-site "Studio Neutral" type system
 * (Inter, ink/faint tokens); variant="supahub" opts into the current public
 * redesign (Bricolage Grotesque headings, violet eyebrow) — both without
 * changing the default editorial (Fraunces/ink) styling used by every other
 * page that renders this component.
 */
function SectionHeading({ eyebrow, title, align = 'center', variant = 'editorial' }: SectionHeadingProps) {
  const isClinical = variant === 'clinical'
  const isSupahub = variant === 'supahub'
  const wrapperClass = align === 'center' ? 'text-center' : 'text-left'
  const eyebrowClass = isSupahub
    ? 'text-xs font-bold uppercase tracking-[0.1em] text-supahub-violet'
    : isClinical
      ? 'font-mono-label flex items-center gap-2 text-xs text-studio-ink-faint' +
        (align === 'center' ? ' justify-center' : '')
      : 'font-mono-label text-xs uppercase text-teal'
  const titleClass = isSupahub
    ? 'font-bricolage mt-4 text-3xl font-semibold leading-tight tracking-[-0.02em] text-supahub-ink sm:text-4xl'
    : isClinical
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
