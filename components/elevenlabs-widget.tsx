'use client'

import { useEffect, useState } from 'react'

// Type declaration for the custom element
type ElevenLabsConvaiElement = HTMLElement & {
  'agent-id': string
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<
        React.HTMLAttributes<ElevenLabsConvaiElement>,
        ElevenLabsConvaiElement
      >
    }
  }
}

export default function ElevenLabsWidget() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Only load widget in production environment
    if (typeof window === 'undefined') return

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed'
    script.async = true
    script.type = 'text/javascript'
    
    script.onload = () => {
      setIsLoaded(true)
      console.log('ElevenLabs widget loaded successfully')
    }
    
    script.onerror = () => {
      setHasError(true)
      console.error('Failed to load ElevenLabs widget')
    }
    
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  // Hide widget if there's an error or it hasn't loaded
  if (hasError || !isLoaded) {
    return null
  }

  return (
    <div className="fixed bottom-32 right-4 z-50">
      {/* @ts-ignore - Custom element from ElevenLabs */}
      <elevenlabs-convai agent-id="agent_7601k0zm6kdvenrb5d1wn5xptvxb"></elevenlabs-convai>
    </div>
  )
}