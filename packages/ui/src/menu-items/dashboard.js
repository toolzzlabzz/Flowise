// assets
import { IconHierarchy, IconBuildingStore, IconKey, IconTool, IconLock, IconTemplate } from '@tabler/icons'

// constant
const icons = { IconHierarchy, IconBooks, IconBuildingStore, IconKey, IconTool, IconLock, IconTemplate, IconPlug }

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const dashboard = {
    id: 'dashboard',
    title: '',
    type: 'group',
    children: [
        {
            id: 'chatflows',
            title: 'Datasets',
            type: 'item',
            url: '/chatflows',
            icon: icons.IconBooks,
            breadcrumbs: true
        },
        {
            id: 'chatflows',
            title: 'Chatflows',
            type: 'item',
            url: '/chatflows',
            icon: icons.IconHierarchy,
            breadcrumbs: true
        },
        {
            id: 'marketplaces',
            title: 'Templates',
            type: 'item',
            url: '/marketplaces',
            icon: icons.IconTemplate,
            breadcrumbs: true
        },
        {
            id: 'tools',
            title: 'Plugins',
            type: 'item',
            url: '/tools',
            icon: icons.IconPlug,
            breadcrumbs: true
        },
        {
            id: 'credentials',
            title: 'Credenciais',
            type: 'item',
            url: '/credentials',
            icon: icons.IconLock,
            breadcrumbs: true
        },
        {
            id: 'apikey',
            title: 'Chaves API',
            type: 'item',
            url: '/apikey',
            icon: icons.IconKey,
            breadcrumbs: true
        }
    ]
}

export default dashboard
