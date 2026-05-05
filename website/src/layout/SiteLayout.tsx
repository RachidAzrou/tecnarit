import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { company } from '../content/company'

type SiteLayoutProps = {
  children: ReactNode
  active?: 'home' | 'privacy'
}

export function SiteLayout({ children, active }: SiteLayoutProps) {
  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Ga naar inhoud
      </a>

      <header className="header">
        <div className="shell header__inner">
          <Link to="/" className="brand" aria-label={`${company.name} — startpagina`}>
            <span className="brand__name">TECNARIT</span>
          </Link>

          <nav className="nav" aria-label="Hoofdnavigatie">
            <a className="nav__link" href="/#wie-we-zijn">
              Wie we zijn
            </a>
            <a className="nav__link" href="/#wat-we-doen">
              Wat we doen
            </a>
            <a className="nav__link" href="/#contact">
              Contact
            </a>
            <Link className="nav__link" aria-current={active === 'privacy' ? 'page' : undefined} to="/privacy">
              Privacy
            </Link>
          </nav>
        </div>
      </header>

      <main id="main" className="main" tabIndex={-1}>
        {children}
      </main>

      <footer className="footer">
        <div className="shell footer__inner">
          <div className="footer__col">
            <div className="footer__brand">{company.name}</div>
            <div className="footer__tagline">{company.tagline}</div>
          </div>
        </div>

        <div className="shell footer__bottom">
          <span className="muted">
            © 2023 {company.name}
          </span>
        </div>
      </footer>
    </div>
  )
}

