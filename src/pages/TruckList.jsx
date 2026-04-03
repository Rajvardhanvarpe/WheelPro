import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchTrucks } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';

const TruckList = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [trucks, setTrucks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useAuth();

    const filteredTrucks = trucks.filter(truck => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const truckNumberMatch = (truck.truckNumber || '').toLowerCase().includes(query);
        const ownerMatch = (truck.owner || '').toLowerCase().includes(query);
        const driverMatch = (truck.driver || '').toLowerCase().includes(query);
        return truckNumberMatch || ownerMatch || driverMatch;
    });

    useEffect(() => {
        const loadTrucks = async () => {
            setLoading(true);
            try {
                const data = await fetchTrucks();
                setTrucks(data);
            } catch (error) {
                console.error("Failed to load trucks", error);
            } finally {
                setLoading(false);
            }
        };
        loadTrucks();
    }, [location]); // Refresh when location changes (e.g., navigating back)

    if (loading) {
        return <div className="p-10 text-center">Loading trucks...</div>;
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header handled by Layout or custom per page if needed. 
          UI shows "Truck Management" header. Layout Sidebar covers navigation.
          We'll add a mobile header or rely on Layout. Layout has mobile bottom nav.
          Let's add mobile header component later if needed, for now inline. */}

            <div className="flex items-center bg-transparent p-4 pb-2 justify-between sticky top-0 z-10 md:hidden">
                <div className="text-workshop-dark dark:text-gray-100 flex size-12 shrink-0 items-center justify-start">
                    <span className="material-symbols-outlined text-2xl">menu</span>
                </div>
                <h2 className="text-workshop-dark dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Truck Management</h2>
                <div className="flex w-12 items-center justify-end">
                    <button className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-transparent text-workshop-dark dark:text-gray-100 p-0">
                        <span className="material-symbols-outlined text-2xl">account_circle</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 p-4">
                <div className="flex min-w-[140px] flex-1 flex-col gap-1 rounded-xl p-4 border border-[#ead9cd] dark:border-[#3d2b1d] bg-white dark:bg-[#2d1f14]">
                    <p className="text-[#a16d45] dark:text-[#c08d65] text-xs font-semibold uppercase tracking-wider">Total Trucks</p>
                    <p className="text-workshop-dark dark:text-white tracking-tight text-2xl font-extrabold leading-tight">{trucks.length}</p>
                </div>
                <div className="flex min-w-[140px] flex-1 flex-col gap-1 rounded-xl p-4 border border-[#ead9cd] dark:border-[#3d2b1d] bg-white dark:bg-[#2d1f14]">
                    <p className="text-[#a16d45] dark:text-[#c08d65] text-xs font-semibold uppercase tracking-wider">Aligned (OK)</p>
                    <p className="text-workshop-dark dark:text-white tracking-tight text-2xl font-extrabold leading-tight">{trucks.filter(t => t.status === 'OK').length}</p>
                </div>
            </div>

            <div className="px-4 py-2">
                <button
                    onClick={() => navigate('/trucks/new')}
                    className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 bg-primary text-white shadow-lg shadow-primary/20 active:scale-95 transition-transform gap-3 text-base font-bold leading-normal tracking-wide"
                >
                    <span className="material-symbols-outlined">add_circle</span>
                    <span>Add New Truck</span>
                </button>
            </div>

            <div className="px-4 py-3">
                <label className="flex flex-col min-w-40 h-12 w-full">
                    <div className="flex w-full flex-1 items-stretch rounded-xl h-full shadow-sm">
                        <div className="text-[#a16d45] flex border-none bg-[#f4ece6] dark:bg-[#3d2b1d] items-center justify-center pl-4 rounded-l-xl">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-xl text-workshop-dark dark:text-white focus:outline-0 focus:ring-0 border-none bg-[#f4ece6] dark:bg-[#3d2b1d] h-full placeholder:text-[#a16d45] dark:placeholder:text-[#c08d65] px-4 pl-2 text-base font-medium leading-normal"
                            placeholder="Search ID, owner, or driver..."
                        />
                    </div>
                </label>
            </div>

            <div className="flex items-center justify-between px-4 pb-2 pt-4">
                <h3 className="text-workshop-dark dark:text-white text-lg font-extrabold leading-tight tracking-tight">
                    {searchQuery ? `Results (${filteredTrucks.length})` : 'Active Trucks'}
                </h3>
                <button className="text-primary text-sm font-bold" onClick={() => setSearchQuery('')}>Filter</button>
            </div>

            <div className="px-4 flex flex-col gap-3 pb-4">
                {filteredTrucks.length === 0 ? (
                    <div className="text-center text-[#a16d45] dark:text-[#c08d65] py-10 text-sm font-medium">
                        No trucks found matching "{searchQuery}"
                    </div>
                ) : null}
                {filteredTrucks.map((truck) => (
                    <div key={truck.id} className="bg-white dark:bg-[#2d1f14] border border-[#ead9cd] dark:border-[#3d2b1d] rounded-xl p-4 flex flex-col gap-3 shadow-sm" onClick={() => navigate(`/trucks/${truck.id}`)}>
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-[#f4ece6] dark:bg-[#3d2b1d] text-[#a16d45] dark:text-primary text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">{truck.type || 'N/A'}</span>
                                    <h4 className="text-lg font-extrabold text-workshop-dark dark:text-white tracking-tight leading-none">{truck.truckNumber}</h4>
                                </div>
                                <p className="text-sm text-[#a16d45] dark:text-[#c08d65] font-medium mt-1">Owner: {truck.owner}</p>
                            </div>
                            <div className="flex gap-1">
                                <button className="size-9 rounded-lg bg-[#f4ece6] dark:bg-[#3d2b1d] flex items-center justify-center text-workshop-dark dark:text-white active:bg-primary/20">
                                    <span className="material-symbols-outlined text-xl">visibility</span>
                                </button>
                                <button className="size-9 rounded-lg bg-[#f4ece6] dark:bg-[#3d2b1d] flex items-center justify-center text-workshop-dark dark:text-white active:bg-primary/20">
                                    <span className="material-symbols-outlined text-xl">edit</span>
                                </button>
                            </div>
                        </div>
                        <div className="h-px bg-[#ead9cd] dark:bg-[#3d2b1d] w-full"></div>
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-[#a16d45] dark:text-[#c08d65]">Driver</span>
                                <span className="text-sm font-semibold text-workshop-dark dark:text-white">{truck.driver}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase font-bold text-[#a16d45] dark:text-[#c08d65]">Current Mileage</span>
                                <span className="text-base font-bold text-primary tabular-nums">{truck.currentKM ? truck.currentKM.toLocaleString() : 'N/A'} KM</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TruckList;
