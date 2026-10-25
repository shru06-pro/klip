/**
 * ==============================================================================
 * FILE: frontend/src/services/qr.service.js
 * WHAT IT DOES: Enterprise QR Code Service isolating QRCode generation and file downloads.
 *               1. Generates high-res PNG Data URLs.
 *               2. Generates SVG vector XML markup strings.
 *               3. Automates browser file downloads for SVG blobs and PNG data URLs.
 * WHERE IT IS CALLED FROM: components/features/result/ActiveResultCard.jsx, components/common/QrModal.jsx.
 * WHOM IT CALLS: QRCode.toDataURL(), QRCode.toString(), Blob, URL.createObjectURL().
 * ==============================================================================
 */

import QRCode from 'qrcode'

const QR_CONFIG = {
  COLOR: {
    dark: '#27272A',
    light: '#FFFFFF',
  },
  DEFAULT_WIDTH: 480,
  DEFAULT_MARGIN: 1.5,
}

class QrService {
  /**
   * Generates a PNG Data URL for a URL string.
   */
  async generateDataUrl(text, options = {}) {
    return QRCode.toDataURL(text, {
      width: options.width || QR_CONFIG.DEFAULT_WIDTH,
      margin: options.margin || QR_CONFIG.DEFAULT_MARGIN,
      color: QR_CONFIG.COLOR,
    })
  }

  /**
   * Generates an SVG vector XML string for a URL string.
   */
  async generateSvgString(text, options = {}) {
    return QRCode.toString(text, {
      type: 'svg',
      margin: options.margin || QR_CONFIG.DEFAULT_MARGIN,
      color: QR_CONFIG.COLOR,
    })
  }

  /**
   * Triggers a browser download for an SVG markup string.
   */
  downloadSvg(svgString, filename = 'klip-qr-code.svg') {
    if (!svgString || typeof window === 'undefined') return
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  /**
   * Triggers a browser download for a PNG Data URL.
   */
  downloadPng(dataUrl, filename = 'klip-qr-code.png') {
    if (!dataUrl || typeof window === 'undefined') return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = filename
    a.click()
  }
}

const qrService = new QrService()
export default qrService
