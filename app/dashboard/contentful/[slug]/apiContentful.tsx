import { client } from '../../../shared/contentfulClient'

export async function fetchSiteSettingData() {
    // Fetch the site settings from Contentful
    const siteSettingsRes = await client.getEntries({
        content_type: 'siteSettings',
        include: 2,
    })
    //console.log(siteSettingsRes)

    // Throw an error if there are multiple siteSettings entries
    if (siteSettingsRes.items.length > 1) {
        throw new Error('Multiple siteSettings entries found')
    }

    // Get the site settings from the response data if they exist (optional chaining)
    // and return them as an object to be used in the page component
    // (e.g. siteSettings.siteTitle, siteSettings.siteDescription)
    // If there are no site settings, siteSettings will be undefined

    const siteSettings = siteSettingsRes.items[0]?.fields

    return {
        siteSettings,
    }
}

export async function fetchPageData(slug: string) {
    // Fetch the page data from Contentful
    const pageRes = await client.getEntries({
        content_type: 'page',
        'fields.slug': slug,
        include: 2,
    })

    // Throw an error if there are multiple page entries
    if (pageRes.items.length > 1) {
        throw new Error('Multiple page entries found')
    }

    // Get the page data from the response data if it exists (optional chaining)
    // and return it as an object to be used in the page component
    // (e.g. page.title, page.content)
    // If there is no page data, page will be undefined

    const page = pageRes.items[0]?.fields

    return {
        page,
    }
}

export async function fetchMenuItems() {
    const response = await client.getEntries({
        content_type: 'mainNavigation',
        include: 4,
    })
    console.log('response', response.items[0]?.fields)
    const menuItems = response.items[0]?.fields.menuItems

    return menuItems
}
