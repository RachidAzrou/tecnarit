export default function App() {
  return (
    <main className="min-h-dvh bg-[rgb(var(--page))]">
      <div className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center px-6 py-16 text-center sm:px-8">
        <img
          src="/brand/tecnarit-mark.png"
          width={72}
          height={72}
          alt="Tecnarit"
          className="rounded-2xl"
          loading="eager"
        />

        <div className="mt-5 text-[13px] font-semibold tracking-[0.22em] text-[rgb(var(--ink))]">
          TECNARIT
        </div>

        <h1 className="mt-5 font-[var(--font-serif)] text-3xl leading-tight tracking-[-0.02em] text-[rgb(var(--ink))] sm:text-4xl">
          Building digital products that support people when it matters most.
        </h1>

        <a
          href="mailto:contact@tecnarit.com"
          className="mt-7 inline-flex items-center rounded-xl bg-[rgb(var(--surface))] px-4 py-2 text-[14px] font-medium text-[rgb(var(--muted))] ring-1 ring-[rgb(var(--line))] transition-colors hover:bg-[color-mix(in_oklab,rgb(var(--surface))_65%,rgb(var(--page)))] hover:text-[rgb(var(--ink))]"
        >
          contact@tecnarit.com
        </a>
      </div>
    </main>
  )
}
