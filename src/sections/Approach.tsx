import { Container } from '../components/ui/Container'
import { SectionHeading } from '../components/ui/SectionHeading'

export function Approach() {
  return (
    <section id="approach" className="border-t border-[rgb(var(--line))]">
      <Container className="py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-14">
          <SectionHeading
            eyebrow="Approach"
            title="Structured product development, designed for adoption."
            description="We work problem-first and user-first. The goal is practical value: products people rely on, not just admire."
          />

          <div className="grid gap-4">
            {[
              {
                title: 'Problem-first thinking',
                body: 'We start from the workflow: the decisions, the constraints, and what success looks like.',
              },
              {
                title: 'Real user needs',
                body: 'We optimize for daily usage—clear screens, understandable states, and minimal friction.',
              },
              {
                title: 'Thoughtful structure',
                body: 'We design systems that stay consistent as they grow, making them easier to operate and maintain.',
              },
              {
                title: 'Practical value',
                body: 'We focus on outcomes: better coordination, fewer errors, and a clearer experience for everyone involved.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[var(--radius)] bg-[rgb(var(--surface))] p-6 ring-1 ring-[rgb(var(--line))]"
              >
                <div className="text-[14px] font-semibold text-[rgb(var(--ink))]">
                  {item.title}
                </div>
                <p className="mt-2 text-[14px] leading-relaxed text-[rgb(var(--muted))]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

