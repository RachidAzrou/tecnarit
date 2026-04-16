import { Container } from '../components/ui/Container'
import { SectionHeading } from '../components/ui/SectionHeading'

export function Vision() {
  return (
    <section id="vision" className="border-t border-[rgb(var(--line))] bg-[rgb(var(--surface))]">
      <Container className="py-16 sm:py-20">
        <div className="grid gap-10">
          <SectionHeading
            eyebrow="Vision"
            title="Technology should solve real problems."
            description="We believe clarity and reliability matter more than hype. The best products feel simple because they are thoughtfully built—designed for people who need to get things done."
          />

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'Real-life utility',
                body: 'Products should support real situations and real responsibilities—not just demos.',
              },
              {
                title: 'Clarity over complexity',
                body: 'Structure and usability are features. Simple flows create confidence and trust.',
              },
              {
                title: 'Reliability as a baseline',
                body: 'When a product is used in meaningful contexts, it must perform consistently and predictably.',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-[var(--radius)] bg-[rgb(var(--page))] p-6 ring-1 ring-[rgb(var(--line))]"
              >
                <div className="text-[14px] font-semibold text-[rgb(var(--ink))]">
                  {card.title}
                </div>
                <p className="mt-2 text-[14px] leading-relaxed text-[rgb(var(--muted))]">
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

