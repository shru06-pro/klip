import { useEffect, useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Main from './components/Main'

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000'

function App() {
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    const path = window.location.pathname.replace(/^\/+/, '')
    // If the path contains a short URL code (non-empty, not static asset)
    if (path && !path.includes('.')) {
      setRedirecting(true)
      window.location.replace(`${apiUrl}/${path}`)
    }
  }, [])

  if (redirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-center p-4">
        <h2 className="text-2xl font-bold text-gray-800">Redirecting...</h2>
        <p className="text-gray-500">Forwarding you to your destination URL.</p>
      </div>
    )
  }

  return (
    <>
      <Header />
      <Hero />
      <Main />
    </>
  );
}

export default App;
