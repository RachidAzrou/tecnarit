import './App.css'

function App() {
  return (
    <div className="page onepage">
      <a className="skip" href="#main">
        Skip to content
      </a>

      <main id="main" className="main-onepage">
        <section className="hero shell" id="top" aria-labelledby="page-title">
          <h1 className="page-title" id="page-title">
            <span className="wordmark wordmark--hero">Tecnarit</span>
            <span className="page-title__line">Technology solutions with social impact.</span>
          </h1>
          <p className="hero__line">
            We design and build products with partners who value craft and measurable social
            outcomes.
          </p>
          <div className="hero__row">
            <span className="chip">Build</span>
            <span className="chip">Impact</span>
            <span className="chip">Ship</span>
          </div>
          <p className="hero__row hero__cta" id="contact">
            <a className="btn" href="mailto:info@tecnarit.com">
              info@tecnarit.com
            </a>
          </p>
        </section>
      </main>

      <footer className="footer">
        <div className="shell footer__inner">
          <span>
            © {new Date().getFullYear()}{' '}
            <span className="wordmark wordmark--footer">Tecnarit</span>
          </span>
          <span className="footer__tag">Technology · Social impact</span>
        </div>
      </footer>
    </div>
  )
}

export default App
