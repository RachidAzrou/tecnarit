import { Container } from '../components/ui/Container'
import { SectionHeading } from '../components/ui/SectionHeading'

export function About() {
  return (
    <section id="about" className="border-t border-[rgb(var(--line))] bg-[rgb(var(--surface))]">
      <Container className="py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <SectionHeading
            eyebrow="About"
            title="A technology holding focused on building and managing digital products."
            description="Tecnarit is structured around long-term product ownership. We invest in solutions that are practical, reliable, and easy to use—built to serve real workflows, not presentations."
          />

          <div className="rounded-[calc(var(--radius)+4px)] bg-[rgb(var(--page))] p-6 ring-1 ring-[rgb(var(--line))] sm:p-7">
            <div className="grid gap-4">
              <div>
                <div className="text-[14px] font-semibold text-[rgb(var(--ink))]">
                  Product-first
                </div>
                <p className="mt-1 text-[14px] leading-relaxed text-[rgb(var(--muted))]">
                  Tecnarit is a holding / product company. We are not a consultancy, QA company, or
                  agency.
                </p>
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[rgb(var(--ink))]">
                  Built for adoption
                </div>
                <p className="mt-1 text-[14px] leading-relaxed text-[rgb(var(--muted))]">
                  We focus on clear, dependable products that fit real operational workflows.
                </p>
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[rgb(var(--ink))]">
                  Independent
                </div>
                <p className="mt-1 text-[14px] leading-relaxed text-[rgb(var(--muted))]">
                  Tecnarit operates as its own company and is not affiliated with ELAZ Group.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

