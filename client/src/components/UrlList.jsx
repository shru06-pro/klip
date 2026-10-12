import { useState } from "react"

export default function UrlList(props) {
    const { urlList } = props
    const [copiedIndex, setCopiedIndex] = useState(null)

    const handleCopy = (shortUrl, index) => {
        navigator.clipboard.writeText(shortUrl)
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 2000)
    }

    return (
        <ul className="list grid grid-cols-1 gap-5">
            {urlList.map((element, index) => {
                const isCopied = copiedIndex === index
                return (
                    <li className="list-item" key={index} id={index}>
                        <div className="links">
                            <a
                                href={element.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="full-url"
                                title={element.url}
                            >
                                {element.url.slice(0, 80)}{element.url.length > 80 ? '...' : ''}
                            </a>
                            <a
                                href={element.shortUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="short-url font-medium"
                            >
                                {element.shortUrl}
                            </a>
                        </div>
                        <button
                            type="button"
                            className={`btn-cta btn-copy transition-all duration-200 ${isCopied ? '!bg-[#3b3054]' : ''}`}
                            onClick={() => handleCopy(element.shortUrl, index)}
                        >
                            {isCopied ? 'Copied!' : 'Copy'}
                        </button>
                    </li>
                )
            })}
        </ul>
    )
}
