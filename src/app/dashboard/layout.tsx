// Dashboard Layout with Sidebar
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="layout-root">
            <Sidebar />
            <div className="main-content">
                <main className="page-content">
                    <div className="container">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
