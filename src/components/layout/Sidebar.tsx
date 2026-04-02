'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: '📊', roles: ['All'] },
  { name: 'Clínica', path: '/clinical', icon: '🩺', roles: ['Admin', 'Doctor', 'Nurse'] },
  { name: 'Historias Clínicas', path: '/dashboard/clinical-history', icon: '📋', roles: ['Admin', 'Doctor', 'Nurse'] },
  { name: 'Pacientes', path: '/patients', icon: '👤', roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist'] },
  { name: 'Agenda', path: '/scheduling', icon: '📅', roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist'] },
  { name: 'Facturación', path: '/billing', icon: '📄', roles: ['Admin', 'Receptionist'] },
  { name: 'Contabilidad', path: '/accounting', icon: '💰', roles: ['Admin'] },
  { name: 'Inventario', path: '/inventory', icon: '📦', roles: ['Admin', 'Nurse'] },
  { name: 'Admin', path: '/admin', icon: '⚙️', roles: ['Admin'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'User';

  // Filter items
  const visibleItems = menuItems.filter(item =>
    item.roles.includes(userRole) || item.roles.includes('All')
  );

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <h1 className="logo">ANTINEO <span className="logo-sub">IPS</span></h1>
      </div>

      <nav className="nav-menu">
        {visibleItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <style jsx>{`
        .sidebar {
          width: var(--sidebar-width);
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(15px);
          border-right: 1px solid var(--border-color);
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          display: flex;
          flex-direction: column;
          z-index: 100;
          box-shadow: 4px 0 20px rgba(0,0,0,0.05);
        }

        .logo-container {
          height: var(--header-height);
          display: flex;
          align-items: center;
          padding: 0 24px;
          border-bottom: 1px solid var(--border-color);
        }

        .logo {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--primary-color);
          letter-spacing: -0.02em;
        }

        .logo-sub {
          color: var(--text-secondary);
          font-weight: 400;
          font-size: 0.9em;
          margin-left: 4px;
        }

        .nav-menu {
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          text-decoration: none;
          color: var(--text-secondary);
          border-radius: 14px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 600;
        }

        .nav-item:hover {
          background-color: rgba(0, 122, 204, 0.05);
          color: var(--primary-color);
          transform: translateX(4px);
        }

        .nav-item.active {
          background-color: var(--primary-color);
          color: white;
          box-shadow: 0 8px 16px rgba(0, 122, 204, 0.25);
        }

        .icon {
          margin-right: 12px;
          font-size: 1.3rem;
        }

        .label {
          font-size: 0.95rem;
        }
      `}</style>
    </aside>
  );
}
