import { MARKS, INLINES } from '@contentful/rich-text-types'
import ScreenReaderOnly from '../components/screenReaderOnly'
import { useState } from 'react'

const links = (content: any) => {
    const [resolvedLinks, setResolvedLinks] = useState<Map<string, string>>(new Map())

    useEffect(() => {
        const resolveAllLinks = async () => {
            const richTextDocument = content
            const linkIds = extractEntryHyperlinkIds(richTextDocument)
            const linkMap = new Map<string, string>()

            for (const [id, value] of linkIds) {
                if (isExternalLinkOrMailto(id)) {
                    // Skip if id is undefined
                    linkMap.set(id, value)
                } else {
                    const url = await resolveLink(id)
                    linkMap.set(id, url)
                }
            }
            setResolvedLinks(linkMap)
        }

        resolveAllLinks()
    }, [content])

    return resolvedLinks
}

export const options = {
    renderMark: {
        [MARKS.BOLD]: text => {
            return (
                <span className="bold-text">
                    <ScreenReaderOnly>{'text i fetstil'}</ScreenReaderOnly> {text}
                </span>
            )
        },
        [MARKS.UNDERLINE]: text => {
            return (
                <span className="underline-text">
                    <ScreenReaderOnly>{'understryken text'}</ScreenReaderOnly> {text}
                </span>
            )
        },
        [MARKS.ITALIC]: text => {
            return (
                <span className="italic-text">
                    <ScreenReaderOnly>{'text i kursiv'}</ScreenReaderOnly> {text}
                </span>
            )
        },
    },
    renderNode: {
        [INLINES.ENTRY_HYPERLINK]: node => {
            const id = node.data.target.sys.id
            const url = resolvedLinks.get(id)
            return url ? (
                <a href={url} className="inline-link">
                    {node.content[0].value}
                </a>
            ) : null
        },
        [INLINES.HYPERLINK]: node => {
            const id = node.data.uri
            const url = resolvedLinks.get(id)
            return url ? (
                <a href={url} target="_blank" className="inline-link">
                    <ScreenReaderOnly>{'extern länk, öppnas i nytt fönster'}</ScreenReaderOnly> {node.content[0].value}
                    {!url.startsWith('mailto:') && (
                        <svg
                            aria-hidden="true"
                            className="external-link-icon"
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            viewBox="0 0 32 32"
                            fill="none"
                        >
                            <path
                                d="M6.66667 28C5.93333 28 5.30556 27.7389 4.78333 27.2167C4.26111 26.6944 4 26.0667 4 25.3333V6.66667C4 5.93333 4.26111 5.30556 4.78333 4.78333C5.30556 4.26111 5.93333 4 6.66667 4H16V6.66667H6.66667V25.3333H25.3333V16H28V25.3333C28 26.0667 27.7389 26.6944 27.2167 27.2167C26.6944 27.7389 26.0667 28 25.3333 28H6.66667ZM12.9333 20.9333L11.0667 19.0667L23.4667 6.66667H18.6667V4H28V13.3333H25.3333V8.53333L12.9333 20.9333Z"
                                fill="#006A52"
                            />
                        </svg>
                    )}
                </a>
            ) : null
        },
    },
    renderText: text =>
        text.split('\n').reduce((children, textSegment, index) => {
            return [...children, index > 0 && <br key={index} />, textSegment]
        }, []),
}
