import { Container } from '../components/ui/Container'

export function Footer() {
  return (
    <footer className="border-t border-[rgb(var(--line))] bg-[rgb(var(--surface))]">
      <Container className="py-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <img
              src="/brand/tecnarit-mark.png"
              width={34}
              height={34}
              alt="Tecnarit"
              className="rounded-lg"
              loading="lazy"
            />
            <div>
              <div className="text-[13px] font-semibold tracking-[0.06em] text-[rgb(var(--ink))]">
                TECNARIT
              </div>
              <div className="text-[12px] text-[rgb(var(--muted))]">
                Holding & product company
              </div>
            </div>
          </div>

          <div className="text-[12px] text-[rgb(var(--muted))]">
            © {new Date().getFullYear()} Tecnarit. All rights reserved.
          </div>
        </div>
      </Container>
    </footer>
  )
}

