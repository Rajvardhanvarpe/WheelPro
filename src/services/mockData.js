export const trucks = [
    { id: 'mock-1', truckNumber: 'ABC-9821', owner: 'FastTrack Logistics', ownerPhone: '+91-9876543210', type: 'Heavy Duty', driver: 'Marcus Sterling', currentKM: 124500, status: 'OK', nextDueDate: '2026-03-15', lastAlignmentDate: '2026-01-15' },
    { id: 'mock-2', truckNumber: 'XYZ-4420', owner: 'Prime Haulage Co.', ownerPhone: '+91-9876543211', type: 'Semi-Trailer', driver: 'Elena Rodriguez', currentKM: 89240, status: 'OK', nextDueDate: '2026-02-20', lastAlignmentDate: '2025-12-20' },
    { id: 'mock-3', truckNumber: 'TRK-0091', owner: 'BuildDirect Inc.', ownerPhone: '+91-9876543212', type: 'Flatbed', driver: 'Sam Wilson', currentKM: 211005, status: 'Due Soon', nextDueDate: '2026-02-12', lastAlignmentDate: '2025-11-12' },
];

export const dashboardStats = {
    totalTrucks: 128,
    ok: 94,
    dueSoon: 22,
    overdue: 12
};

export const recentActivity = [
    { id: 'activity-1', truckId: 'mock-1', truckNumber: 'TK-402', owner: 'Swift Logistics', date: '2023-10-15', status: 'OK', statusColor: 'bg-green-600' },
    { id: 'activity-2', truckId: 'mock-2', truckNumber: 'TK-551', owner: 'Global Haulers', date: '2023-09-02', status: 'Soon', statusColor: 'bg-amber-500' },
    { id: 'activity-3', truckId: 'mock-3', truckNumber: 'TK-108', owner: 'Peak Transport', date: '2023-06-20', status: 'Alert', statusColor: 'bg-red-600' },
    { id: 'activity-4', truckId: 'mock-1', truckNumber: 'TK-772', owner: 'FastLane Fleet', date: '2023-11-10', status: 'OK', statusColor: 'bg-green-600' },
];
