import Menu from '../components/menu'
import { fetchSiteSettingData, fetchMenuItems } from './apiContentful'

export const experimental_ppr = true

export default async function Layout({ children }: { children: React.ReactNode }) {
    const layoutProps: any = await fetchSiteSettingData()
    const menuItems: any = await fetchMenuItems()

    const {
        siteSettings: { siteFooterEmail },
    } = layoutProps

    return (
        <>
            <div style={{ border: '1px solid blue' }}>
                <Menu items={menuItems} />
            </div>
            {children}
            <div style={{ border: '1px solid red' }}>{siteFooterEmail}</div>
        </>
    )
}
