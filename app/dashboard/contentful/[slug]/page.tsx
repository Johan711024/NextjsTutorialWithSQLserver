import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import styled from 'styled-components'
import { fetchPageData } from './apiContentful'
//import { options } from './options'   // todo: förstå options

export default async function Page({ params: { slug } }: { params: { slug: string } }) {
    console.log('props', slug)
    const { page } = await fetchPageData(slug)
    console.log('page', page)
    const { title, pageTitle, content, sections }: any = page
    //console.log('sections', sections)

    const contentfulContent = documentToReactComponents(content)
    //const contentfulContent = documentToReactComponents(content, options)
    const lowerCaseSections: Record<string, any> = {}

    const renderSections = sections => {
        return sections.map((section: any, i: number) => {
            let contentfulComponentId = section?.sys?.contentType?.sys?.id.toLowerCase()
            const Component: React.ElementType = lowerCaseSections[contentfulComponentId]

            if (!Component) {
                return <div key={i}>create a component for {section?.sys?.contentType?.sys?.id}</div>
            } else {
                return <Component index={i} data={section} key={section.sys.id} />
            }
        })
    }

    return (
        <>
            <main>
                <div>Titel: {title}</div>
                <div>Slug: {slug}</div>
                <div>Rubrik: {pageTitle}</div>
                <div>Innehåll:{contentfulContent}</div>
                <div>Övrigt: {sections ? renderSections(sections) : <>Finns inga övriga sektioner</>}</div>
            </main>
        </>
    )
}
