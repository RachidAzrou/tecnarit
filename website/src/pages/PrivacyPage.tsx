import { Link } from 'react-router-dom'
import { SiteLayout } from '../layout/SiteLayout'
import { company } from '../content/company'

export function PrivacyPage() {
  return (
    <SiteLayout active="privacy">
      <div className="shell page-narrow">
        <div className="page-head">
          <p className="kicker">Privacy</p>
          <h1 className="page-title">Privacyverklaring</h1>
          <p className="page-lead">
            Deze privacyverklaring beschrijft hoe {company.name} omgaat met persoonsgegevens die u met ons deelt via e-mail.
          </p>
        </div>

        <article className="prose prose--page" aria-label="Privacyverklaring">
          <h2>1. Welke gegevens kunnen we verzamelen?</h2>
          <p>Wanneer u ons contacteert via e-mail, kunnen we de volgende gegevens ontvangen:</p>
          <ul>
            <li>Naam</li>
            <li>E-mailadres</li>
            <li>Organisatie (optioneel)</li>
            <li>Berichtinhoud</li>
          </ul>

          <h2>2. Waarom verzamelen we deze gegevens?</h2>
          <p>We gebruiken uw gegevens uitsluitend om:</p>
          <ul>
            <li>uw vraag of bericht te beantwoorden</li>
            <li>contact met u op te nemen in het kader van uw aanvraag</li>
          </ul>

          <h2>3. Hoe worden de gegevens gebruikt en bewaard?</h2>
          <p>
            De gegevens worden enkel gebruikt voor communicatie over uw aanvraag. We bewaren persoonsgegevens niet langer dan nodig is om uw bericht te behandelen, tenzij er een wettelijke verplichting bestaat om bepaalde informatie langer te bewaren.
          </p>

          <h2>4. Delen van gegevens</h2>
          <p>
            {company.name} deelt geen persoonsgegevens met derden, behalve wanneer dit noodzakelijk is om uw aanvraag te behandelen of wanneer dit wettelijk verplicht is.
          </p>

          <h2>5. Cookies en tracking</h2>
          <p>
            Deze website gebruikt geen onnodige tracking. Indien er in de toekomst analytische of marketingtools worden toegevoegd, wordt dit eerst duidelijk vermeld en wordt deze privacyverklaring bijgewerkt.
          </p>

          <h2>6. Uw rechten</h2>
          <p>
            U kan vragen om uw persoonsgegevens in te kijken, te verbeteren of te verwijderen. U kan ook bezwaar maken tegen bepaalde verwerkingen, conform de toepasselijke privacywetgeving.
          </p>

          <h2>7. Contact</h2>
          <p>
            Voor vragen over privacy kan u contact opnemen via <span className="nowrap">{company.email}</span>.
          </p>

          <p className="muted">
            Laatste update: {new Date().toLocaleDateString('nl-BE', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </article>

        <div className="page-actions">
          <Link className="btn btn--secondary" to="/">
            Terug naar startpagina
          </Link>
        </div>
      </div>
    </SiteLayout>
  )
}

