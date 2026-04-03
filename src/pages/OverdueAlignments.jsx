import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOverdueTrucks } from '../services/dataService';

const OverdueAlignments = () => {
    const navigate = useNavigate();
    const [overdueTrucks, setOverdueTrucks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await getOverdueTrucks();
                setOverdueTrucks(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const openWhatsApp = (e, item, recipientPhone) => {
        e.stopPropagation();
        const phone = (recipientPhone || '').replace(/\D/g, '');
        if (!phone) {
            alert('No phone number available for this contact.');
            return;
        }
        const message = encodeURIComponent(
            `*Wheel Alignment Reminder*\n\nTruck: ${item.truckNumber || 'N/A'}\nDriver: ${item.driver || 'N/A'}\n\nDue Date: ${item.lastAlignmentDate || 'N/A'} *(OVERDUE)*\n\nPlease visit the workshop soon to avoid any issues or unnecessary tire wear!\n\n*G.Jadhav Enterprises*`
        );
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    };

    const filteredTrucks = overdueTrucks.filter(item => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            (item.truckNumber || '').toLowerCase().includes(q) ||
            (item.owner || '').toLowerCase().includes(q)
        );
    });

    if (loading) return <div className="p-10 text-center dark:text-gray-100">Loading...</div>;

    return (
        <div className="dark:bg-background-dark dark:text-gray-100 min-h-screen flex flex-col pb-24">
            <div className="flex items-center bg-transparent p-4 pb-2 justify-between sticky top-0 z-50 backdrop-blur-sm bg-white/30 dark:bg-background-dark/30">
                <div className="text-workshop-dark dark:text-gray-100 flex size-12 shrink-0 items-center justify-start">
                    <button className="flex items-center justify-center" onClick={() => navigate(-1)}>
                        <span className="material-symbols-outlined text-2xl">arrow_back_ios</span>
                    </button>
                </div>
                <h2 className="text-workshop-dark dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Overdue Alignments ({filteredTrucks.length})</h2>
                <div className="flex w-12 items-center justify-end">
                    <button className="flex items-center justify-center h-12 bg-transparent text-workshop-dark dark:text-gray-100 p-0">
                        <span className="material-symbols-outlined text-2xl">filter_list</span>
                    </button>
                </div>
            </div>

            <div className="px-4 py-3">
                <label className="flex flex-col min-w-40 h-12 w-full">
                    <div className="flex w-full flex-1 items-stretch rounded-xl h-full overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
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

            <div className="px-4 flex flex-col gap-4">
                {filteredTrucks.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">
                        {searchQuery ? `No trucks found matching "${searchQuery}"` : 'No overdue trucks found.'}
                    </p>
                ) : (
                    filteredTrucks.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-red-100 dark:border-red-900/40">
                            {/* Top row: Owner Name + OVERDUE badge + WhatsApp icons */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="font-black text-workshop-dark dark:text-white text-base truncate">{item.owner || 'Unknown Owner'}</span>
                                    <span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0">OVERDUE</span>
                                </div>
                                {/* WhatsApp icon buttons (owner + driver) */}
                                <div className="flex gap-1.5 ml-2 shrink-0">
                                    {item.ownerPhone && (
                                        <button
                                            onClick={(e) => openWhatsApp(e, item, item.ownerPhone)}
                                            title={`WhatsApp Owner: ${item.ownerPhone}`}
                                            className="flex items-center justify-center size-9 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 active:scale-90 transition-all"
                                        >
                                            <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.668 4.61 1.832 6.502L4 29l7.697-1.802A11.946 11.946 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3z" fill="#25D366" />
                                                <path d="M21.5 18.5c-.3-.15-1.77-.873-2.045-.972-.274-.1-.474-.15-.673.15-.2.298-.773.972-.947 1.172-.174.198-.348.223-.648.075-.3-.15-1.265-.466-2.41-1.485-.89-.793-1.49-1.773-1.664-2.073-.174-.298-.018-.46.13-.608.134-.134.3-.348.448-.522.15-.175.2-.3.3-.498.1-.2.05-.374-.025-.523-.075-.15-.673-1.622-.922-2.22-.243-.583-.49-.504-.673-.514l-.573-.01c-.2 0-.523.074-.797.373-.274.3-1.047 1.022-1.047 2.492 0 1.47 1.072 2.892 1.222 3.09.15.2 2.11 3.22 5.114 4.514.714.308 1.272.492 1.706.63.717.228 1.37.196 1.885.119.575-.086 1.77-.724 2.02-1.422.25-.699.25-1.298.175-1.422-.074-.124-.274-.199-.573-.348z" fill="white" />
                                            </svg>
                                        </button>
                                    )}
                                    {item.driverPhone && (
                                        <button
                                            onClick={(e) => openWhatsApp(e, item, item.driverPhone)}
                                            title={`WhatsApp Driver: ${item.driverPhone}`}
                                            className="flex items-center justify-center size-9 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 active:scale-90 transition-all"
                                        >
                                            <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.668 4.61 1.832 6.502L4 29l7.697-1.802A11.946 11.946 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3z" fill="#25D366" />
                                                <path d="M21.5 18.5c-.3-.15-1.77-.873-2.045-.972-.274-.1-.474-.15-.673.15-.2.298-.773.972-.947 1.172-.174.198-.348.223-.648.075-.3-.15-1.265-.466-2.41-1.485-.89-.793-1.49-1.773-1.664-2.073-.174-.298-.018-.46.13-.608.134-.134.3-.348.448-.522.15-.175.2-.3.3-.498.1-.2.05-.374-.025-.523-.075-.15-.673-1.622-.922-2.22-.243-.583-.49-.504-.673-.514l-.573-.01c-.2 0-.523.074-.797.373-.274.3-1.047 1.022-1.047 2.492 0 1.47 1.072 2.892 1.222 3.09.15.2 2.11 3.22 5.114 4.514.714.308 1.272.492 1.706.63.717.228 1.37.196 1.885.119.575-.086 1.77-.724 2.02-1.422.25-.699.25-1.298.175-1.422-.074-.124-.274-.199-.573-.348z" fill="white" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Detail rows */}
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2.5 col-span-2">
                                    <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-0.5">Owner Name</p>
                                    <p className="text-sm font-black text-workshop-dark dark:text-white flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm text-primary">person</span>
                                        {item.owner || 'N/A'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Truck No</p>
                                    <p className="text-sm font-black text-workshop-dark dark:text-white flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm text-primary">local_shipping</span>
                                        {item.truckNumber || 'N/A'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Owner Phone</p>
                                    <p className="text-sm font-black text-workshop-dark dark:text-white flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm text-primary">phone</span>
                                        {item.ownerPhone || 'N/A'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Driver Phone</p>
                                    <p className="text-sm font-black text-workshop-dark dark:text-white flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm text-primary">phone</span>
                                        {item.driverPhone || item.driver || 'N/A'}
                                    </p>
                                </div>
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2.5">
                                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-0.5">Last Alignment</p>
                                    <p className="text-sm font-black text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">event</span>
                                        {item.lastAlignmentDate || 'Never'}
                                    </p>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => navigate(`/alignments/new?truckId=${item.id}`)}
                                className="w-full bg-primary text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                            >
                                <span className="material-symbols-outlined text-lg">event_available</span>
                                Schedule Alignment
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default OverdueAlignments;
