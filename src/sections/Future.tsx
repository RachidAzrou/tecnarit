import { Container } from '../components/ui/Container'
import { SectionHeading } from '../components/ui/SectionHeading'

export function Future() {
  return (
    <section id="future" className="border-t border-[rgb(var(--line))] bg-[rgb(var(--surface))]">
      <Container className="py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-14">
          <SectionHeading
            eyebrow="Future"
            title="A growing portfolio beyond a single product."
            description="Tecnarit continues exploring opportunities where technology can improve operational clarity and user experience—always with a long-term view on ownership and maintenance."
          />

          <div className="rounded-[calc(var(--radius)+4px)] bg-[rgb(var(--page))] p-6 ring-1 ring-[rgb(var(--line))]">
            <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-[rgb(var(--muted))]">
              What we look for
            </div>
            <ul className="mt-4 space-y-3 text-[14px] leading-relaxed text-[rgb(var(--ink))]">
              {[
                'Operational environments where clarity reduces stress and errors',
                'Workflows that benefit from structured coordination and follow-up',
                'Products that can be maintained and improved over years, not months',
                'Teams who value reliability, usability, and respectful design',
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-[rgb(var(--accent))]" />
                  <span className="text-[rgb(var(--muted))]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  )
}

