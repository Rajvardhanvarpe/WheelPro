import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAlignments, fetchTruckById } from '../services/dataService';

const TruckDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [truck, setTruck] = useState(null);

    useEffect(() => {
        const loadHistory = async () => {
            if (id) {
                try {
                    const [alignmentsData, truckData] = await Promise.all([
                        fetchAlignments(id),
                        fetchTruckById(id)
                    ]);
                    setHistory(alignmentsData);
                    setTruck(truckData);
                } catch (error) {
                    console.error("Failed to load history", error);
                }
            }
        };
        loadHistory();
    }, [id]);

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen pb-24">
            {/* Header Section (Dark Theme) */}
            <div className="bg-workshop-dark text-white pt-4 pb-8 px-4 rounded-b-xl shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2" onClick={() => navigate(-1)}>
                        <span className="material-symbols-outlined cursor-pointer">arrow_back_ios</span>
                        <span className="text-sm font-semibold cursor-pointer">Back</span>
                    </div>
                    <h1 className="text-lg font-bold">Vehicle Profile</h1>
                    <span className="material-symbols-outlined cursor-pointer">more_horiz</span>
                </div>
                <div className="flex flex-col gap-4">
                    <div>
                        <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">Fleet Vehicle</p>
                        <h2 className="text-5xl font-extrabold tracking-tight">{truck?.truckNumber || id}</h2>
                    </div>
                    {/* Status Card */}
                    <div className="bg-form-container/10 border border-white/10 backdrop-blur-md rounded-xl p-4 flex justify-between items-center">
                        <div className="flex flex-col gap-1">
                            <p className="text-white/70 text-xs font-medium uppercase">Current Status</p>
                            <div className="flex items-center gap-2">
                                <div className={`size-2 rounded-full animate-pulse ${truck?.status === 'OVERDUE' ? 'bg-red-500' : 'bg-green-400'}`}></div>
                                <p className="text-lg font-bold">{truck?.status || 'OK'}</p>
                            </div>
                            <p className="text-white/80 text-sm mt-1">Owner: <span className="text-white font-semibold">{truck?.owner || 'Unknown'}</span></p>
                        </div>
                        <div className="text-right">
                            <p className="text-white/70 text-xs font-medium uppercase leading-none mb-1">Total KM</p>
                            <p className="text-2xl font-bold tracking-tight">{truck?.currentKM ? truck.currentKM.toLocaleString('en-IN') : '0'} <span className="text-sm font-normal">km</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3 px-4 py-6">
                <button className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold transition-all active:scale-95 shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                    Edit Truck
                </button>
                <button
                    className="flex-[1.5] flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-white font-bold transition-all active:scale-95 shadow-md shadow-primary/20"
                    onClick={() => navigate(`/alignments/new?truckId=${id}`)}
                >
                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                    New Alignment
                </button>
            </div>

            {/* Alignment History Section */}
            <div className="px-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Alignment History</h3>
                    <span className="text-primary text-sm font-bold">View All</span>
                </div>
                {/* History Timeline */}
                <div className="relative space-y-4">
                    {history.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-4">No alignment history found.</p>
                    ) : (
                        history.map((record, index) => (
                            <div key={record.id || index} className="relative pl-6 before:absolute before:left-[11px] before:top-4 before:bottom-[-20px] before:w-[2px] before:bg-zinc-200 dark:before:bg-zinc-700 last:before:hidden">
                                <div className={`absolute left-0 top-1.5 size-[24px] rounded-full flex items-center justify-center z-10 ${index === 0 ? 'bg-primary/20' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                                    <div className={`size-2 rounded-full ${index === 0 ? 'bg-primary' : 'bg-zinc-400'}`}></div>
                                </div>
                                <div className={`bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-100 dark:border-zinc-700 shadow-sm ${index !== 0 ? 'opacity-90' : ''}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-bold text-zinc-900 dark:text-white text-base">{record.alignmentDate || 'N/A'}</p>
                                        <span className="text-xs bg-zinc-100 dark:bg-zinc-700 px-2 py-1 rounded-full text-zinc-500 font-bold tracking-tight">{record.alignmentKM || '-'} km</span>
                                    </div>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-3">
                                        {record.notes || 'Routine check completed.'}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="size-6 rounded-full bg-zinc-200 dark:bg-zinc-600 flex items-center justify-center overflow-hidden">
                                            <span className="material-symbols-outlined text-[14px]">person</span>
                                        </div>
                                        <p className="text-xs text-zinc-500 font-medium">Tech: {record.technician || 'Unknown'}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default TruckDetail;
