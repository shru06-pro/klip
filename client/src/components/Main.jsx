import Shortener from "./Shortener"
import CallToAction from "./CallToAction"
import { TiDeleteOutline } from "react-icons/ti"
import UrlList from "./UrlList"
import { useState, useEffect } from "react"

const getLocalStorage = () => {
    try {
        const raw = localStorage.getItem('links')
        if (!raw) return []
        const parsed = JSON.parse(raw)
        // Automatically migrate any legacy localhost:5000 links to localhost:3000
        return parsed.map((item) => {
            const shortUrl = item.shortUrl
                ? item.shortUrl.replace('http://localhost:5000', 'http://localhost:3000')
                : item.shortUrl
            return { ...item, shortUrl }
        })
    } catch {
        return []
    }
}

export default function Main() {
    const [links, setLinks] = useState(getLocalStorage)

    useEffect(() => {
        localStorage.setItem('links', JSON.stringify(links))
    }, [links])

    function addLink(newItem) {
        setLinks([newItem, ...links])
    }

    function hideLinks() {
        setLinks([])
    }

    return (
        <main>
            <Shortener addLink={addLink} />
            <UrlList urlList={links} />
            {links.length > 0 && (
                <div className="flex justify-center items-center my-6">
                    <button
                        type="button"
                        onClick={hideLinks}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm text-gray-500 hover:text-red-500 hover:bg-gray-200/50 transition-colors"
                        title="Clear all saved links"
                    >
                        <TiDeleteOutline className="text-xl" />
                        <span>Clear all links</span>
                    </button>
                </div>
            )}
            <section className="stats pb-11 lg:pb-20">
                <h3 className="title pb-2">Advanced Statistics</h3>
                <p className="subtitle">
                    Track how many clicks your shortened URLs receive and measure their performance.
                </p>
            </section>
            <CallToAction />
        </main>
    )
}
