import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';

const NavItem = ({ to, icon, label, mobileOnly = false }) => (
    <NavLink
        to={to}
        className={({ isActive }) => clsx(
            "flex flex-col items-center gap-1.5 transition-colors",
            isActive ? "text-primary" : "text-[#a16d45] dark:text-[#c08d65] hover:text-primary",
            mobileOnly && "md:hidden"
        )}
    >
        <span className={clsx("material-symbols-outlined text-[28px]", "font-variation-settings: 'FILL' 1")}>
            {icon}
        </span>
        <span className="text-[11px] font-bold tracking-tight">{label}</span>
    </NavLink>
);

const SidebarItem = ({ to, icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) => clsx(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
            isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-[#a16d45] dark:text-[#c08d65] hover:bg-gray-100 dark:hover:bg-gray-800"
        )}
    >
        <span className="material-symbols-outlined text-2xl">{icon}</span>
        <span className="font-bold">{label}</span>
    </NavLink>
);

const Layout = () => {
    const navigate = useNavigate();
    const { signOut, user } = useAuth();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };
    return (
        <div className="flex min-h-screen bg-background-light dark:bg-background-dark">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 border-r border-[#ead9cd] dark:border-[#3d2b1d] bg-white/80 dark:bg-[#23180f]/80 backdrop-blur-md p-4 sticky top-0 h-screen">
                <div className="flex items-center gap-2 mb-8 px-2">
                    {/* Truck Tyre SVG */}
                    <svg width="52" height="52" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 drop-shadow-lg">
                        {/* Dark tyre body fills entire circle */}
                        <circle cx="50" cy="50" r="49" fill="#252525" />
                        {/* Orange tread ring: r=42, strokeWidth=12 => spans r=36 to r=48 */}
                        <circle cx="50" cy="50" r="42" stroke="#f97316" strokeWidth="12" fill="none" />
                        {/* Dark tread separators through orange band (r=35 to r=49) */}
                        {Array.from({ length: 20 }).map((_, i) => {
                            const angle = (i * 18) * Math.PI / 180;
                            return <line key={i}
                                x1={50 + 35 * Math.cos(angle)} y1={50 + 35 * Math.sin(angle)}
                                x2={50 + 49 * Math.cos(angle)} y2={50 + 49 * Math.sin(angle)}
                                stroke="#252525" strokeWidth="4" strokeLinecap="butt" />;
                        })}
                        {/* Inner tyre wall */}
                        <circle cx="50" cy="50" r="35" fill="#252525" />
                        {/* Rim plate */}
                        <circle cx="50" cy="50" r="29" fill="#3d3d3d" />
                        <circle cx="50" cy="50" r="29" stroke="#5a5a5a" strokeWidth="2" fill="none" />
                        <circle cx="50" cy="50" r="20" stroke="#5a5a5a" strokeWidth="1.5" fill="none" />
                        {/* 8 bolt holes */}
                        {Array.from({ length: 8 }).map((_, i) => {
                            const a = (i * 45 - 90) * Math.PI / 180;
                            return <circle key={i} cx={50 + 14 * Math.cos(a)} cy={50 + 14 * Math.sin(a)} r="3.5" fill="#252525" stroke="#666" strokeWidth="1" />;
                        })}
                        {/* Center hub */}
                        <circle cx="50" cy="50" r="7" fill="#f97316" />
                        <circle cx="50" cy="50" r="3" fill="#252525" />
                    </svg>
                    <h1 className="text-2xl font-extrabold text-[#1d130c] dark:text-white tracking-tight">
                        Wh<span className="text-primary">ee</span>lTrack
                    </h1>
                </div>

                <nav className="flex flex-col gap-2">
                    <SidebarItem to="/dashboard" icon="dashboard" label="Dashboard" />
                    <SidebarItem to="/trucks" icon="local_shipping" label="Trucks" />
                    <SidebarItem to="/alignments/new" icon="straighten" label="Alignment" />
                    <SidebarItem to="/reports" icon="assessment" label="Reports" />
                    <SidebarItem to="/billing" icon="payments" label="Billing" />
                    <SidebarItem to="/pending-bills" icon="receipt_long" label="Pending" />
                </nav>

                {/* User info + Logout at the bottom of sidebar */}
                <div className="mt-auto pt-4 border-t border-[#ead9cd] dark:border-[#3d2b1d]">
                    {user && (
                        <p className="text-[10px] text-[#a16d45] dark:text-[#c08d65] font-semibold px-2 mb-2 truncate">{user.email}</p>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left transition-all text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold"
                    >
                        <span className="material-symbols-outlined text-2xl">logout</span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 w-full pb-24 md:pb-4 overflow-y-auto">
                <Outlet />
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#23180f]/95 backdrop-blur-xl border-t border-[#ead9cd] dark:border-[#3d2b1d] pb-[env(safe-area-inset-bottom,24px)] pt-3 px-4 flex justify-between items-center z-50 md:hidden">
                <NavItem to="/dashboard" icon="dashboard" label="Dashboard" />
                <NavItem to="/alignments/new" icon="straighten" label="Alignment" />
                <NavItem to="/reports" icon="assessment" label="Reports" />
                <NavItem to="/billing" icon="payments" label="Billing" />
                <NavItem to="/pending-bills" icon="receipt_long" label="Pending" />
                <NavItem to="/trucks" icon="local_shipping" label="Trucks" />
                <button
                    onClick={handleLogout}
                    className="flex flex-col items-center gap-1.5 text-red-500 hover:text-red-600 transition-colors"
                >
                    <span className="material-symbols-outlined text-[28px]">logout</span>
                    <span className="text-[11px] font-bold tracking-tight">Logout</span>
                </button>
            </nav>
        </div>
    );
};

export default Layout;
