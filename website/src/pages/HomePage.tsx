import { useMemo } from 'react'
import { SiteLayout } from '../layout/SiteLayout'
import { company } from '../content/company'

type ServiceCard = { title: string; text: string }
export function HomePage() {
  const serviceCards: ServiceCard[] = useMemo(
    () => [
      {
        title: 'Mobiele applicaties',
        text: 'We ontwikkelen gebruiksvriendelijke mobiele toepassingen voor burgers, gemeenschappen en specifieke doelgroepen.',
      },
      {
        title: 'Webplatformen',
        text: 'We bouwen digitale omgevingen voor organisaties, beheerders en operationele teams.',
      },
      {
        title: 'Digitale workflows',
        text: 'We brengen structuur in processen die vandaag vaak versnipperd, manueel of onduidelijk verlopen.',
      },
      {
        title: 'Mensgerichte technologie',
        text: 'We ontwerpen oplossingen voor contexten waar vertrouwen, eenvoud en toegankelijkheid belangrijk zijn.',
      },
    ],
    [],
  )

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent('Contact — TECNARIT VOF')
    const body = encodeURIComponent(
      `Naam:\nE-mail:\nOrganisatie:\n\nBericht:\n`,
    )
    return `mailto:${company.email}?subject=${subject}&body=${body}`
  }, [])

  return (
    <SiteLayout active="home">
      <div className="page">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="shell">
            <div className="hero__inner">
              <div className="hero__content">
                <p className="kicker">TECNARIT VOF</p>
                <h1 className="hero__title" id="hero-title">
                  Digitale oplossingen voor maatschappelijke noden.
                </h1>
                <p className="hero__subtitle">
                  TECNARIT ontwikkelt apps en digitale platformen die mensen, organisaties en gemeenschappen ondersteunen in situaties waar duidelijkheid, structuur en toegankelijkheid belangrijk zijn.
                </p>

                <div className="hero__ctas">
                  <a className="btn btn--primary" href="/#wat-we-doen">
                    Ontdek wat we doen
                  </a>
                  <a className="btn btn--secondary" href="/#contact">
                    Neem contact op
                  </a>
                </div>

                <div className="hero__intro">
                  <p>
                    Technologie is pas waardevol wanneer ze mensen echt helpt. Daarom bouwen wij digitale toepassingen die vertrekken vanuit concrete noden in de samenleving. Geen complexe systemen om indruk te maken, maar duidelijke oplossingen die praktisch inzetbaar zijn en aansluiten bij de realiteit van gebruikers.
                  </p>
                </div>
              </div>

              <div className="hero__aside" aria-label="Kernpunten">
                <div className="stat-card">
                  <div className="stat-card__title">Focus</div>
                  <div className="stat-card__text">Maatschappelijke en operationele ondersteuning</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card__title">Aanpak</div>
                  <div className="stat-card__text">Duidelijk, zorgvuldig en bruikbaar</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card__title">Resultaat</div>
                  <div className="stat-card__text">Werkende toepassingen die mensen verder helpen</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="wie-we-zijn" aria-labelledby="wie-title">
          <div className="shell">
            <div className="section__head">
              <h2 id="wie-title">Wie we zijn</h2>
            </div>
            <div className="prose">
              <p>
                TECNARIT VOF is een Belgische technologieonderneming die digitale oplossingen ontwikkelt met een duidelijke maatschappelijke meerwaarde. We combineren technische expertise, productontwikkeling en operationeel inzicht om toepassingen te bouwen die mensen helpen, processen vereenvoudigen en organisaties beter ondersteunen in hun dagelijkse werking.
              </p>
              <p>
                Onze projecten vertrekken niet vanuit technologie om de technologie, maar vanuit echte situaties waarin mensen begeleiding, duidelijkheid of ondersteuning nodig hebben.
              </p>
            </div>
          </div>
        </section>

        <section className="section section--tint" id="wat-we-doen" aria-labelledby="wat-title">
          <div className="shell">
            <div className="section__head">
              <h2 id="wat-title">Wat we doen</h2>
              <p className="section__lead">
                We bouwen digitale oplossingen die helder aanvoelen voor gebruikers en praktisch inzetbaar zijn voor organisaties.
              </p>
            </div>
            <div className="grid grid--cards" role="list">
              {serviceCards.map((c) => (
                <article className="card" key={c.title} role="listitem">
                  <h3 className="card__title">{c.title}</h3>
                  <p className="card__text">{c.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="focus" aria-labelledby="focus-title">
          <div className="shell">
            <div className="section__head">
              <h2 id="focus-title">Onze focus</h2>
            </div>
            <div className="two-col">
              <div className="prose">
                <p>
                  TECNARIT richt zich op digitale oplossingen binnen domeinen waar technologie een ondersteunende rol kan spelen in het dagelijkse leven van mensen en organisaties.
                </p>
              </div>
              <ul className="bullets">
                <li>Sociale dienstverlening</li>
                <li>Gemeenschapsgerichte toepassingen</li>
                <li>Administratieve vereenvoudiging</li>
                <li>Communicatie en begeleiding</li>
                <li>Digitale ondersteuning in gevoelige situaties</li>
                <li>Toegankelijke technologie voor maatschappelijke processen</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="section" id="waarom" aria-labelledby="waarom-title">
          <div className="shell">
            <div className="section__head">
              <h2 id="waarom-title">Waarom TECNARIT</h2>
            </div>
            <div className="two-col">
              <div className="prose">
                <p>
                  Wat TECNARIT onderscheidt, is de combinatie van technische uitvoering en maatschappelijke gevoeligheid. Digitale oplossingen in sociale contexten moeten meer doen dan alleen functioneren. Ze moeten betrouwbaar, helder, toegankelijk en zorgvuldig ontworpen zijn.
                </p>
              </div>
              <ul className="bullets">
                <li>Maatschappelijke meerwaarde als uitgangspunt</li>
                <li>Gebruiksvriendelijke digitale ervaringen</li>
                <li>Focus op betrouwbaarheid en eenvoud</li>
                <li>Begrip voor gevoelige en menselijke contexten</li>
                <li>Van idee tot werkende applicatie</li>
                <li>Praktisch, schaalbaar en toekomstgericht</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="section section--tint" id="contact" aria-labelledby="contact-title">
          <div className="shell">
            <div className="section__head">
              <h2 id="contact-title">Neem contact op</h2>
              <p className="section__lead">
                Heeft u een idee, project of maatschappelijke uitdaging waarvoor digitale ondersteuning nodig is? Neem contact met ons op. We denken graag mee over een haalbare en doeltreffende digitale oplossing.
              </p>
            </div>

            <div className="contact contact--single">
              <div className="contact__details" aria-label="Contactgegevens">
                <div className="contact-card">
                  <div className="contact-card__title">{company.name}</div>
                  <dl className="contact-card__dl">
                    <div>
                      <dt>E-mail</dt>
                      <dd>
                        <a href={mailtoHref}>{company.email}</a>
                      </dd>
                    </div>
                    <div>
                      <dt>Website</dt>
                      <dd>{company.domain}</dd>
                    </div>
                    <div>
                      <dt>Ondernemingsnummer / btw</dt>
                      <dd>{company.vat}</dd>
                    </div>
                    <div>
                      <dt>Adres</dt>
                      <dd>{company.address}</dd>
                    </div>
                  </dl>
                  <div className="contact-card__actions">
                    <a className="btn btn--primary btn--full" href={mailtoHref}>
                      Stuur een e-mail
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </SiteLayout>
  )
}

