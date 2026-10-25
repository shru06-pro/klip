/**
 * ==============================================================================
 * FILE: frontend/src/index.js
 * WHAT IT DOES: React client entry point for the Klip. web application.
 *               Initializes the React 18 Concurrent Root, mounts `<App />` into
 *               the DOM `#root` container, imports global styles (`./index.css`),
 *               and invokes Web Vitals performance reporting.
 * WHERE IT IS CALLED FROM: Executed by Webpack bundle on page load in public/index.html.
 * WHOM IT CALLS: ReactDOM.createRoot(), root.render(), reportWebVitals(), <App />.
 * WHERE THAT CALL IS GOING: Injects the virtual DOM tree into HTML element with id="root".
 * ==============================================================================
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'

// FUNCTION CALL: ReactDOM.createRoot(document.getElementById('root'))
// - WHAT IT DOES: Creates a React 18 root on the DOM node.
// - WHERE IT IS CALLED FROM: Application startup.
// - WHOM IT CALLS: React 18 concurrent rendering engine.
// - WHERE THAT CALL IS GOING: Binds to `<div id="root">` inside `public/index.html`.
const root = ReactDOM.createRoot(document.getElementById('root'))

// FUNCTION CALL: root.render(<App />)
// - WHAT IT DOES: Renders top-level React component tree inside React.StrictMode.
// - WHERE THAT CALL IS GOING: Translates JSX components into browser DOM nodes.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// FUNCTION CALL: reportWebVitals()
// - WHAT IT DOES: Measures Core Web Vitals (CLS, FID, FCP, LCP, TTFB) for site performance.
// - WHERE THAT CALL IS GOING: Logs performance metrics or pushes to telemetry endpoint.
reportWebVitals()
