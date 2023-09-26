// assets
import { IconTrash, IconFileUpload, IconFileExport, IconCopy, IconSearch } from '@tabler/icons'

// constant
const icons = { IconTrash, IconFileUpload, IconFileExport, IconCopy, IconSearch }

// ==============================|| SETTINGS MENU ITEMS ||============================== //

const settings = {
    id: 'settings',
    title: '',
    type: 'group',
    children: [
        {
            id: 'duplicateChatflow',
            title: 'Duplicar Chatflow',
            type: 'item',
            url: '',
            icon: icons.IconCopy
        },
        {
            id: 'loadChatflow',
            title: 'Importar Chatflow',
            type: 'item',
            url: '',
            icon: icons.IconFileUpload
        },
        {
            id: 'exportChatflow',
            title: 'Exportar Chatflow',
            type: 'item',
            url: '',
            icon: icons.IconFileExport
        },
        {
            id: 'analyseChatflow',
            title: 'Chatflow Analytics',
            type: 'item',
            url: '',
            icon: icons.IconSearch
        },
        {
            id: 'deleteChatflow',
            title: 'Deletar Chatflow',
            type: 'item',
            url: '',
            icon: icons.IconTrash
        }
    ]
}

export default settings
