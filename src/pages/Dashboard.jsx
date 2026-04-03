import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../components/StatsCard';
import { useAuth } from '../contexts/AuthContext';
import { requestLocalNotificationPermission, checkAndNotifyAlignments } from '../services/notificationService';

import { getDashboardStats, getRecentActivity, fetchTrucks } from '../services/dataService';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalTrucks: 0, ok: 0, dueSoon: 0, overdue: 0 });
    const [activity, setActivity] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [notificationStatus, setNotificationStatus] = useState(
        "Notification" in window ? Notification.permission : "denied"
    );

    // Derived state for filtered activity
    const filteredActivity = activity.filter(item => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const truckIdMatch = (item.truckNumber || item.id || '').toLowerCase().includes(query);
        const ownerMatch = (item.owner || '').toLowerCase().includes(query);
        return truckIdMatch || ownerMatch;
    });

    const handleEnableNotifications = async () => {
        const granted = await requestLocalNotificationPermission();
        if (granted) {
            setNotificationStatus('granted');
            alert('Notifications enabled successfully! 🚛');
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const [statsData, activityData, allTrucks] = await Promise.all([
                    getDashboardStats(),
                    getRecentActivity(),
                    fetchTrucks()
                ]);

                // Update Dashboard stats
                setStats(prev => ({ ...prev, ...(statsData || {}) }));

                // Enrich recent alignments with owner and status info from allTrucks
                const enrichedActivity = (activityData || []).map(a => {
                    const matchedTruck = (allTrucks || []).find(t => t.id === a.truckId) || {};
                    return {
                        id: a.id,
                        truckId: a.truckId || matchedTruck.id,
                        truckNumber: a.truckNumber || matchedTruck.truckNumber,
                        owner: matchedTruck.owner || 'Unknown',
                        ownerPhone: matchedTruck.ownerPhone || '',
                        status: matchedTruck.status || 'OK',
                        statusColor: matchedTruck.status === 'OVERDUE' ? 'bg-red-600' : (matchedTruck.status === 'OK' ? 'bg-green-600' : 'bg-primary'),
                        date: a.alignmentDate || 'N/A'
                    };
                });

                const activityTruckIds = new Set(enrichedActivity.map(a => a.truckId));

                // Map trucks not already listed in recent activity
                const trucksAsActivity = (allTrucks || [])
                    .filter(t => !activityTruckIds.has(t.id))
                    .map(truck => ({
                        id: truck.id,
                        truckId: truck.id,
                        truckNumber: truck.truckNumber,
                        owner: truck.owner || 'Unknown',
                        ownerPhone: truck.ownerPhone || '',
                        status: truck.status || 'OK',
                        statusColor: truck.status === 'OVERDUE' ? 'bg-red-600' : (truck.status === 'OK' ? 'bg-green-600' : 'bg-primary'),
                        date: truck.lastAlignmentDate || 'N/A'
                    }));

                const combinedData = [...enrichedActivity, ...trucksAsActivity];

                // Sort properly to ensure correct sequence (newest first)
                combinedData.sort((a, b) => {
                    if (a.date === 'N/A') return 1;
                    if (b.date === 'N/A') return -1;
                    return new Date(b.date) - new Date(a.date);
                });

                setActivity(combinedData);

                // Trigger client-side notification check for due trucks
                if (allTrucks && allTrucks.length > 0) {
                    checkAndNotifyAlignments(allTrucks);
                }
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return <div className="p-4 text-center">Loading dashboard...</div>;
    }

    return (
        <div className="relative flex h-auto w-full flex-col overflow-x-hidden">
            {/* Top Header Mock (handled by Layout Sidebar in Desktop, but needed for Mobile title if not in Layout) */}
            {/* The Layout handles navigation, but the page content usually needs a header. 
          The UI shows "Dashboard Overview" header with menu icon. 
          Since Layout has Sidebar on Desktop, we might hide the menu icon on desktop. 
      */}
            <div className="flex items-center bg-transparent p-4 pb-2 justify-between sticky top-0 z-10 md:hidden">
                <div className="text-workshop-dark dark:text-gray-100 flex size-12 shrink-0 items-center justify-start">
                    {/* Menu handled by Layout? Or we trigger sidebar? For now just static */}
                    <span className="material-symbols-outlined text-2xl">menu</span>
                </div>
                <h2 className="text-workshop-dark dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Dashboard Overview</h2>
                <div className="flex w-12 items-center justify-end">
                    <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-transparent text-workshop-dark dark:text-gray-100 gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0">
                        <span className="material-symbols-outlined text-2xl">notifications</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 p-4">
                {/* Notification Toggle Banner */}
                {notificationStatus !== 'granted' && (
                    <div className="w-full bg-primary/10 border border-primary/20 rounded-xl p-4 mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">notifications_active</span>
                            <div>
                                <p className="text-workshop-dark dark:text-white text-sm font-bold">Stay Updated!</p>
                                <p className="text-gray-500 dark:text-gray-400 text-xs">Turn on push alerts for truck reminders.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleEnableNotifications}
                            className="bg-primary hover:bg-primary/90 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all active:scale-95"
                        >
                            Enable
                        </button>
                    </div>
                )}

                <StatsCard
                    title="Total Trucks"
                    value={stats.totalTrucks}
                    icon="local_shipping"
                    iconColor="text-primary"
                    trend={true}
                    trendIcon="trending_up"
                    trendText="+5%"
                    trendColor="text-[#07880e]"
                    borderColor="border-primary"
                    onClick={() => navigate('/trucks')}
                />
                <StatsCard
                    title="OK"
                    value={stats.ok}
                    icon="check_circle"
                    iconColor="text-green-600"
                    trend={true}
                    trendIcon="check"
                    trendText="Optimal"
                    trendColor="text-[#07880e]"
                    borderColor="border-green-500"
                    onClick={() => navigate('/trucks')}
                />
                <StatsCard
                    title="Due Soon"
                    value={stats.dueSoon}
                    icon="schedule"
                    iconColor="text-primary"
                    trend={true}
                    trendIcon="priority_high"
                    trendText="7 Days"
                    trendColor="text-primary"
                    borderColor="border-primary"
                    onClick={() => navigate('/alignments/due-soon')}
                />
                <StatsCard
                    title="Overdue"
                    value={stats.overdue}
                    icon="warning"
                    iconColor="text-red-600"
                    trend={true}
                    trendIcon="emergency"
                    trendText="Action Required"
                    trendColor="text-red-600"
                    borderColor="border-red-500"
                    onClick={() => navigate('/alignments/overdue')}
                />
            </div>

            <div className="px-4 py-2">
                <label className="flex flex-col min-w-40 h-12 w-full">
                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full overflow-hidden shadow-sm">
                        <div className="text-workshop-dark dark:text-primary flex border-none bg-white dark:bg-gray-800 items-center justify-center pl-4 border-r-0">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden text-workshop-dark dark:text-white focus:outline-0 focus:ring-0 border-none bg-white dark:bg-gray-800 focus:border-none h-full placeholder:text-gray-400 px-4 pl-2 text-base font-normal leading-normal"
                            placeholder="Search truck number or owner"
                        />
                    </div>
                </label>
            </div>

            <div className="flex items-center justify-between px-4 pb-2 pt-5">
                <h2 className="text-workshop-dark dark:text-white text-[20px] font-bold leading-tight tracking-[-0.015em]">Alignment Status</h2>
                <button onClick={() => navigate('/alignments/new')} className="bg-primary text-white px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">add</span> New
                </button>
            </div>

            <div className="px-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex bg-workshop-dark text-white font-bold text-[10px] uppercase tracking-widest py-1.5 px-3">
                        <div className="flex-1">Truck Detail</div>
                        <div className="w-16 text-right">Status</div>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredActivity.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">No trucks found matching "{searchQuery}"</div>
                        ) : (
                            filteredActivity.map((item) => (
                                <div key={item.id} onClick={() => navigate(`/trucks/${item.truckId || item.id}`)} className="py-2.5 px-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-workshop-dark dark:text-white text-sm">{item.truckNumber || item.id}</span>
                                        <span className={`${item.statusColor} text-white px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider min-w-[50px] text-center`}>{item.status}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1 font-medium">
                                            {item.owner}
                                            {item.ownerPhone && (
                                                <>
                                                    <span className="mx-0.5 opacity-50">•</span>
                                                    {item.ownerPhone}
                                                </>
                                            )}
                                        </span>
                                        <span>Done: {item.date}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            <div className="h-24 md:h-0"></div>
        </div>
    );
};

export default Dashboard;
