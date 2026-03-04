import './admin.css'

export const metadata = {
    title: 'Backoffice | Habitante',
}

export default async function AdminLayout({ children }) {
    // Base layout just provides the fonts and global admin class
    return (
        <div className="admin-root">
            <link
                href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&family=Archivo:wght@300;400;500;600;700;800&display=swap"
                rel="stylesheet"
            />
            <link
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1"
                rel="stylesheet"
            />
            {children}
        </div>
    )
}
