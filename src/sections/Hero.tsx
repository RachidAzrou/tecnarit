import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Container } from '../components/ui/Container'

function ArrowRightIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={props.className}>
      <path
        fill="currentColor"
        d="M11.35 4.3a1 1 0 0 1 1.41 0l5.0 5a1 1 0 0 1 0 1.41l-5.0 5a1 1 0 1 1-1.41-1.41L14.64 11H3a1 1 0 1 1 0-2h11.64l-3.29-3.29a1 1 0 0 1 0-1.41Z"
      />
    </svg>
  )
}

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[860px] -translate-x-1/2 rounded-[999px] bg-[radial-gradient(closest-side,rgba(34,84,61,0.12),transparent)] blur-2xl" />
      </div>

      <Container className="relative py-14 sm:py-18 lg:py-22">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <Badge className="bg-[rgb(var(--surface))]">
              Holding & product company • Built for real-world use
            </Badge>

            <h1 className="mt-6 font-[var(--font-serif)] text-[42px] leading-[1.02] tracking-[-0.03em] text-[rgb(var(--ink))] sm:text-[54px]">
              Building digital products that support people when it matters most.
            </h1>

            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[rgb(var(--muted))] sm:text-[17px]">
              Tecnarit develops purposeful digital solutions focused on real-world impact, with a
              strong emphasis on clarity, reliability, and usability.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href="#about" size="lg" variant="primary">
                Learn more <ArrowRightIcon className="h-4 w-4 opacity-90" />
              </Button>
              <Button href="#contact" size="lg" variant="secondary">
                Get in touch
              </Button>
            </div>

            <div className="mt-10 grid max-w-xl gap-3 rounded-2xl bg-[rgb(var(--surface))] p-5 ring-1 ring-[rgb(var(--line))] sm:grid-cols-3">
              <div className="space-y-1">
                <div className="text-[12px] font-medium uppercase tracking-[0.14em] text-[rgb(var(--muted))]">
                  Ownership
                </div>
                <div className="text-[14px] font-medium text-[rgb(var(--ink))]">
                  We build & own products
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[12px] font-medium uppercase tracking-[0.14em] text-[rgb(var(--muted))]">
                  Independence
                </div>
                <div className="text-[14px] font-medium text-[rgb(var(--ink))]">
                  Not affiliated with ELAZ Group
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[12px] font-medium uppercase tracking-[0.14em] text-[rgb(var(--muted))]">
                  Focus
                </div>
                <div className="text-[14px] font-medium text-[rgb(var(--ink))]">
                  Not a consultancy or agency
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[var(--radius)] bg-[rgb(var(--surface))] p-5 ring-1 ring-[rgb(var(--line))] shadow-[0_18px_55px_-35px_rgba(12,18,24,0.40)] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-[rgb(var(--muted))]">
                    Tecnarit
                  </div>
                  <div className="text-[16px] font-semibold text-[rgb(var(--ink))]">
                    Product ownership
                  </div>
                </div>
                <img
                  src="/brand/tecnarit-dark.png"
                  alt="Tecnarit logo"
                  className="h-10 w-auto opacity-90"
                  loading="eager"
                />
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-[color-mix(in_oklab,rgb(var(--surface))_70%,rgb(var(--page)))] p-5 ring-1 ring-[rgba(var(--line),0.9)]">
                  <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-[rgb(var(--muted))]">
                    What we do
                  </div>
                  <div className="mt-2 text-[14px] leading-relaxed text-[rgb(var(--muted))]">
                    We build, operate, and improve digital products over the long term—designed for
                    clarity, reliability, and adoption.
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Long-term', pct: 'Ownership' },
                    { label: 'Principled', pct: 'Clarity' },
                    { label: 'Practical', pct: 'Usability' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl bg-white p-4 ring-1 ring-[rgb(var(--line))]"
                    >
                      <div className="text-[12px] text-[rgb(var(--muted))]">{item.label}</div>
                      <div className="mt-1 text-[14px] font-semibold text-[rgb(var(--ink))]">
                        {item.pct}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl bg-white p-4 ring-1 ring-[rgb(var(--line))]">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-[rgb(var(--muted))]">
                      Positioning
                    </div>
                    <span className="rounded-full bg-[rgba(var(--accent),0.10)] px-3 py-1 text-[12px] font-medium text-[rgb(var(--accent))]">
                      Product company
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-[13px] text-[rgb(var(--muted))]">
                    <div>Not ELAZ Group</div>
                    <div>Not a consultancy, QA company, or agency</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute -right-14 -top-14 hidden h-48 w-48 rounded-[60px] bg-[radial-gradient(closest-side,rgba(20,121,64,0.18),transparent)] blur-lg lg:block" />
          </div>
        </div>
      </Container>
    </section>
  )
}

