import { Button } from '../components/ui/Button'
import { SectionHeading } from '../components/ui/SectionHeading'

const EMAIL = 'contact@tecnarit.com'

export function Contact() {
  return (
    <section id="contact" className="border-t border-[rgb(var(--line))]">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:px-8 sm:py-20">
        <div className="rounded-[calc(var(--radius)+6px)] bg-[rgb(var(--surface))] p-7 ring-1 ring-[rgb(var(--line))] sm:p-10">
          <SectionHeading
            eyebrow="Contact"
            title="Let’s connect"
            description="Interested in our products or in discussing a collaboration? We would be glad to hear from you."
          >
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href={`mailto:${EMAIL}`} size="lg" variant="primary">
                Contact us
              </Button>
              <a
                href={`mailto:${EMAIL}`}
                className="text-[14px] font-medium text-[rgb(var(--muted))] no-underline hover:text-[rgb(var(--ink))] hover:underline"
              >
                {EMAIL}
              </a>
            </div>
          </SectionHeading>
        </div>
      </div>
    </section>
  )
}

