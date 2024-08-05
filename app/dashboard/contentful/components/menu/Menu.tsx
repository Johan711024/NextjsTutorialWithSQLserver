import Link from 'next/link'

const Menu = ({ items }: any) => {
    return (
        <>
            Menu
            {items &&
                items.map((item: any) => {
                    const link: any = item.fields.link
                    const title: string = item.fields.title
                    const id: string = item.sys.id
                    //console.log('link', link)
                    const slug: string = link.fields.slug
                    return (
                        <p>
                            <Link
                                href={`/dashboard/contentful/${slug}`}
                                key={id}
                                style={{ textDecoration: 'underline' }}
                            >
                                {title}
                            </Link>
                        </p>
                    )
                })}
        </>
    )
}

export default Menu
