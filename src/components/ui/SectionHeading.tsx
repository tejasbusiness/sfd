interface SectionHeadingProps {
  eyebrow: string
  title: string
  align?: 'left' | 'center'
}

function SectionHeading({ eyebrow, title, align = 'center' }: SectionHeadingProps) {
  return (
    <div className={align === 'center' ? 'text-center' : 'text-left'}>
      <p className="font-mono-label text-xs uppercase text-teal">{eyebrow}</p>
      <h2 className="font-display mt-2 text-3xl font-light leading-tight text-ink sm:text-4xl">
        {title}
      </h2>
    </div>
  )
}

export default SectionHeading
