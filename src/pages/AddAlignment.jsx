import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import { addAlignment, fetchTrucks } from '../services/dataService';

const AddAlignment = () => {
    const navigate = useNavigate();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [km, setKm] = useState('');
    const [truckId, setTruckId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [trucks, setTrucks] = useState([]);
    const [loadingTrucks, setLoadingTrucks] = useState(true);

    const [searchParams] = useSearchParams();

    // Load trucks on component mount
    useEffect(() => {
        const loadTrucks = async () => {
            console.log('🚛 AddAlignment: Loading trucks for dropdown...');
            try {
                const data = await fetchTrucks();
                // Sort trucks by newest first (created_at descending)
                const sortedData = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setTrucks(sortedData);
                
                // If we navigated here from a specific truck's history page, auto-select it
                const preselectedId = searchParams.get('truckId');
                if (preselectedId) {
                    setTruckId(preselectedId);
                } else if (sortedData.length > 0) {
                    // Auto-select the very latest truck they just created
                    setTruckId(sortedData[0].id);
                }
            } catch (error) {
                console.error('❌ AddAlignment: Failed to load trucks:', error);
            } finally {
                setLoadingTrucks(false);
            }
        };
        loadTrucks();
    }, []);

    const handleSubmit = async () => {
        if (!truckId) {
            alert("Please select a truck");
            return;
        }
        setSubmitting(true);
        try {
            // Find the selected truck to get its truckNumber
            const selectedTruck = trucks.find(t => t.id === truckId);

            await addAlignment({
                truckId,
                truckNumber: selectedTruck?.truckNumber || truckId,
                alignmentDate: date,
                currentKM: parseInt(km) || 0,
                nextDueDate: new Date(new Date(date).setDate(new Date(date).getDate() + 35)).toISOString().split('T')[0] // +35 days
            });
            navigate('/dashboard');
        } catch (error) {
            console.error("Error saving alignment", error);
            alert("Failed to save alignment");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center p-4 justify-between max-w-md mx-auto">
                    <button onClick={() => navigate(-1)} className="text-workshop-dark dark:text-white flex items-center justify-center p-1">
                        <span className="material-symbols-outlined">arrow_back_ios</span>
                    </button>
                    <h2 className="text-workshop-dark dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-8">Add New Alignment</h2>
                </div>
            </header>

            <main className="flex-1 w-full max-w-md mx-auto px-4 py-6">
                {/* Headline */}
                <div className="mb-6">
                    <h3 className="text-workshop-dark dark:text-white tracking-light text-2xl font-bold leading-tight">New Alignment Entry</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Record wheel alignment for workshop tracking.</p>
                </div>

                {/* Main Form Container */}
                <div className="bg-form-container dark:bg-gray-800 p-5 rounded-xl shadow-sm space-y-5">
                    {/* Select Truck */}
                    <div className="flex flex-col gap-2">
                        <label className="text-workshop-dark dark:text-gray-200 text-sm font-semibold uppercase tracking-wider">Select Vehicle</label>
                        <select
                            className="flex w-full rounded-lg text-workshop-dark focus:outline-0 focus:ring-2 focus:ring-primary border-none bg-white dark:bg-gray-700 dark:text-white h-14 px-4 text-base font-medium shadow-sm"
                            value={truckId}
                            onChange={(e) => setTruckId(e.target.value)}
                            disabled={loadingTrucks}
                        >
                            <option disabled value="">{loadingTrucks ? 'Loading trucks...' : 'Choose a truck...'}</option>
                            {trucks.map((truck) => (
                                <option key={truck.id} value={truck.id}>
                                    {truck.truckNumber} ({truck.owner})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Alignment Date */}
                    <div className="flex flex-col gap-2">
                        <label className="text-workshop-dark dark:text-gray-200 text-sm font-semibold uppercase tracking-wider">Service Date</label>
                        <div className="relative">
                            <input
                                className="flex w-full rounded-lg text-workshop-dark focus:outline-0 focus:ring-2 focus:ring-primary border-none bg-white dark:bg-gray-700 dark:text-white h-14 px-4 text-base font-medium shadow-sm pr-12"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">calendar_today</span>
                        </div>
                    </div>

                    {/* Alignment KM */}
                    <div className="flex flex-col gap-2">
                        <label className="text-workshop-dark dark:text-gray-200 text-sm font-semibold uppercase tracking-wider">Current Odometer</label>
                        <div className="flex w-full items-stretch rounded-lg shadow-sm overflow-hidden">
                            <input
                                className="flex w-full min-w-0 flex-1 border-none focus:outline-0 focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-workshop-dark dark:text-white h-14 px-4 text-base font-medium"
                                placeholder="Enter KM"
                                type="number"
                                value={km}
                                onChange={(e) => setKm(e.target.value)}
                            />
                            <div className="text-gray-500 bg-white dark:bg-gray-700 dark:text-gray-400 flex items-center justify-center px-4 border-l border-gray-100 dark:border-gray-600">
                                <span className="material-symbols-outlined">speed</span>
                            </div>
                        </div>
                    </div>

                    {/* Auto-calculated Display */}
                    <div className="bg-white/40 dark:bg-gray-900/40 p-4 rounded-lg border border-white/20">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/20 p-2 rounded-full">
                                <span className="material-symbols-outlined text-primary text-xl">event_upcoming</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Recommended Next Service</p>
                                <p className="text-workshop-dark dark:text-white text-lg font-bold">
                                    {date ? new Date(new Date(date).setDate(new Date(date).getDate() + 35)).toLocaleDateString() : '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Optional workshop photo upload placeholder */}
                <div className="mt-6 border-2 border-dashed border-form-container dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center gap-2 text-gray-400">
                    <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                    <p className="text-sm font-medium">Attach Alignment Report Photo</p>
                </div>
            </main>

            {/* Sticky Bottom Button Area (Mobile only per UI intent but shown always here since generic) */}
            <footer className="p-4 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md sticky bottom-0 z-40 pb-[env(safe-area-inset-bottom,20px)]">
                <div className="max-w-md mx-auto">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        <span className="material-symbols-outlined">{submitting ? 'hourglass_top' : 'save'}</span>
                        {submitting ? 'Saving...' : 'Save Alignment'}
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default AddAlignment;
