'use client'

import { useEffect } from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'agent-id': string
        },
        HTMLElement
      >
    }
  }
}

export default function ElevenLabsWidget() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed'
    script.async = true
    script.type = 'text/javascript'
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div className="fixed bottom-32 right-4 z-50">
      <elevenlabs-convai agent-id="agent_7601k0zm6kdvenrb5d1wn5xptvxb"></elevenlabs-convai>
    </div>
  )
}