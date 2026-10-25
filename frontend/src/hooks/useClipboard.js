/**
 * ==============================================================================
 * FILE: frontend/src/hooks/useClipboard.js
 * WHAT IT DOES: Custom React hook managing clipboard copying and visual confirmation timeouts.
 * WHERE IT IS CALLED FROM: ActiveResultCard.jsx, UrlList.jsx.
 * WHOM IT CALLS: navigator.clipboard.writeText(), setTimeout().
 * ==============================================================================
 */

import { useState, useCallback, useRef, useEffect } from 'react'

export function useClipboard(timeoutDuration = 2400) {
  const [copiedKey, setCopiedKey] = useState(null)
  const timerRef = useRef(null)

  const copy = useCallback(
    (text, key = 'default') => {
      if (!navigator.clipboard) return Promise.resolve(false)

      return navigator.clipboard.writeText(text).then(() => {
        setCopiedKey(key)
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
          setCopiedKey(null)
        }, timeoutDuration)
        return true
      }).catch((err) => {
        console.error('[useClipboard] Failed to copy text:', err)
        return false
      })
    },
    [timeoutDuration]
  )

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return {
    copiedKey,
    isCopied: (key = 'default') => copiedKey === key,
    copy,
  }
}
