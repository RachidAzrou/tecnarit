import { useEffect, useState } from 'react'

type SplashScreenProps = {
  durationMs?: number
}

export function SplashScreen({ durationMs = 2000 }: SplashScreenProps) {
  const [visible, setVisible] = useState(true)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const t1 = window.setTimeout(() => setLeaving(true), Math.max(0, durationMs - 220))
    const t2 = window.setTimeout(() => setVisible(false), durationMs)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [durationMs])

  if (!visible) return null

  return (
    <div className={leaving ? 'splash splash--leaving' : 'splash'} role="status" aria-live="polite">
      <div className="splash__inner">
        <div className="splash__wordmark" aria-label="TECNARIT">
          TECNARIT
        </div>
      </div>
    </div>
  )
}

