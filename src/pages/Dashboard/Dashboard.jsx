import { useState } from 'react';
import styles from './Dashboard.module.css';
import ccetLogo from '../../assets/CCET-LOGO.png';

// TODO: replace with the logged-in user's real data (from auth context / API)
const CURRENT_USER = {
    name: 'Aarav Sharma',
    rollNumber: '22103045',
    email: 'aarav.sharma@ccet.ac.in',
    branch: 'Computer Science',
};

// TODO: replace with a real API call once the backend is ready
const GRIEVANCES = [
    { id: 'GR-1042', subject: 'Wi-Fi not working in hostel block C', category: 'Infrastructure', status: 'Pending', date: '12 Aug 2026' },
    { id: 'GR-1041', subject: 'Incorrect marks uploaded for DBMS', category: 'Academic', status: 'In Progress', date: '10 Aug 2026' },
    { id: 'GR-1038', subject: 'Canteen food quality complaint', category: 'Facilities', status: 'Resolved', date: '05 Aug 2026' },
    { id: 'GR-1035', subject: 'Library late fee waiver request', category: 'Administrative', status: 'Rejected', date: '02 Aug 2026' },
    { id: 'GR-1030', subject: 'Broken chair in Room 214', category: 'Infrastructure', status: 'Resolved', date: '28 Jul 2026' },
];

const NAV_ITEMS = [
    { key: 'all', label: 'All Grievances', icon: 'list' },
    { key: 'new', label: 'Submit Grievance', icon: 'plus' },
    { key: 'mine', label: 'My Grievances', icon: 'user' },
    { key: 'notifications', label: 'Notifications', icon: 'bell' },
    { key: 'settings', label: 'Settings', icon: 'gear' },
];

const ICONS = {
    list: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M8 6h13M8 12h13M8 18h13" />
            <path d="M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
    ),
    plus: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 5v14M5 12h14" />
        </svg>
    ),
    user: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="8" r="3.2" />
            <path d="M4.5 20c1.6-3.6 4.7-5.4 7.5-5.4S17.9 16.4 19.5 20" />
        </svg>
    ),
    bell: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 01-3.4 0" />
        </svg>
    ),
    gear: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.6V21a2 2 0 11-4 0v-.2a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.6-1H3a2 2 0 110-4h.2a1.7 1.7 0 001.6-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.6V3a2 2 0 114 0v.2a1.7 1.7 0 001 1.6 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.6 1H21a2 2 0 110 4h-.2a1.7 1.7 0 00-1.6 1z" />
        </svg>
    ),
    logout: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
        </svg>
    ),
    search: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
        </svg>
    ),
};

const STATUS_CLASS = {
    Pending: 'statusPending',
    'In Progress': 'statusProgress',
    Resolved: 'statusResolved',
    Rejected: 'statusRejected',
};

export default function Dashboard() {
    const [activeNav, setActiveNav] = useState('all');
    const [query, setQuery] = useState('');

    const filtered = GRIEVANCES.filter((g) =>
        (g.subject + g.id + g.category).toLowerCase().includes(query.toLowerCase())
    );

    const initials = CURRENT_USER.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className={styles.appShell}>
            {/* ===================== SIDEBAR ===================== */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarBrand}>
                    <img src={ccetLogo} alt="CCET Logo" className={styles.sidebarBadge} />
                    <span className={styles.sidebarBrandName}>Grievance Portal</span>
                </div>

                {/* ---- Profile ---- */}
                <div className={styles.profileBox}>
                    <div className={styles.avatar}>{initials}</div>
                    <div className={styles.profileInfo}>
                        <span className={styles.profileName}>{CURRENT_USER.name}</span>
                        <span className={styles.profileMeta}>{CURRENT_USER.rollNumber} &middot; {CURRENT_USER.branch}</span>
                    </div>
                </div>

                {/* ---- Navigation ---- */}
                <nav className={styles.nav}>
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            className={`${styles.navItem} ${activeNav === item.key ? styles.navItemActive : ''}`}
                            onClick={() => setActiveNav(item.key)}
                        >
                            <span className={styles.navIcon}>{ICONS[item.icon]}</span>
                            <span className={styles.navLabel}>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <button type="button" className={styles.logoutBtn}>
                    <span className={styles.navIcon}>{ICONS.logout}</span>
                    <span className={styles.navLabel}>Log out</span>
                </button>
            </aside>

            {/* ===================== MAIN CONTENT ===================== */}
            <main className={styles.main}>
                <header className={styles.topbar}>
                    <div>
                        <h1 className={styles.pageTitle}>All Grievances</h1>
                        <p className={styles.pageSubtitle}>Track and manage submitted grievances</p>
                    </div>

                    <div className={styles.topbarActions}>
                        <div className={styles.searchWrap}>
                            <span className={styles.searchIcon}>{ICONS.search}</span>
                            <input
                                type="text"
                                placeholder="Search grievances..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>
                        <button type="button" className={styles.newBtn}>
                            <span className={styles.navIcon}>{ICONS.plus}</span>
                            New Grievance
                        </button>
                    </div>
                </header>

                <section className={styles.content}>
                    {filtered.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>No grievances match your search.</p>
                        </div>
                    ) : (
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Subject</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th aria-label="Actions" />
                                </tr>
                                </thead>
                                <tbody>
                                {filtered.map((g) => (
                                    <tr key={g.id}>
                                        <td className={styles.idCell}>{g.id}</td>
                                        <td>{g.subject}</td>
                                        <td>{g.category}</td>
                                        <td>
                                                <span className={`${styles.statusBadge} ${styles[STATUS_CLASS[g.status]]}`}>
                                                    {g.status}
                                                </span>
                                        </td>
                                        <td className={styles.dateCell}>{g.date}</td>
                                        <td>
                                            <button type="button" className={styles.viewBtn}>View</button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}