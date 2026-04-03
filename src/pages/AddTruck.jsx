import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addTruck } from '../services/dataService';

const AddTruck = () => {
    const navigate = useNavigate();
    const [truckNumber, setTruckNumber] = useState('');
    const [owner, setOwner] = useState('');
    const [ownerPhone, setOwnerPhone] = useState('');
    const [driver, setDriver] = useState('');
    const [driverPhone, setDriverPhone] = useState('');
    const [type, setType] = useState('Heavy Duty');
    const [mileage, setMileage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('📝 AddTruck: Form submitted');
        console.log('📝 Form data:', { truckNumber, owner, driver, type, mileage });

        setSubmitting(true);
        try {
            const truckData = {
                truckNumber,
                owner,
                ownerPhone,
                driver,
                driverPhone,
                type,
                currentKM: parseInt(mileage) || 0,
                status: 'OK',
                nextDueDate: '',
                lastAlignmentDate: ''
            };

            console.log('📝 AddTruck: Calling addTruck with data:', truckData);
            const truckId = await addTruck(truckData);
            console.log('✅ AddTruck: Truck added successfully with ID:', truckId);

            if (truckId.startsWith('mock-truck-id-')) {
                console.error('⚠️ WARNING: Truck was NOT saved to Firestore! Got mock ID:', truckId);
                alert('Warning: Truck may not have been saved. Check console for errors.');
            }

            console.log('📝 AddTruck: Navigating to /trucks');
            navigate('/trucks');
        } catch (error) {
            console.error("❌ AddTruck: Error in form submission:", error);
            alert("Failed to add truck: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
            <header className="sticky top-0 z-20 bg-background-light dark:bg-background-dark border-b border-form-container dark:border-gray-700">
                <div className="flex items-center p-4 pb-2 justify-between">
                    <div className="text-workshop-dark dark:text-white flex size-12 shrink-0 items-center cursor-pointer" onClick={() => navigate(-1)}>
                        <span className="material-symbols-outlined">chevron_left</span>
                    </div>
                    <h2 className="text-workshop-dark dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
                        Add New Truck
                    </h2>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto pb-4 px-4">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">

                    {/* Truck Number / ID */}
                    <div className="flex flex-col gap-2">
                        <label className="text-workshop-dark dark:text-gray-200 text-sm font-semibold uppercase tracking-wider">Vehicle ID / Plate</label>
                        <input
                            required
                            className="flex w-full rounded-lg text-workshop-dark focus:outline-0 focus:ring-2 focus:ring-primary border-none bg-white dark:bg-gray-700 dark:text-white h-14 px-4 text-base font-medium shadow-sm"
                            placeholder="e.g. TRK-9921"
                            value={truckNumber}
                            onChange={(e) => setTruckNumber(e.target.value)}
                        />
                    </div>

                    {/* Owner */}
                    <div className="flex flex-col gap-2">
                        <label className="text-workshop-dark dark:text-gray-200 text-sm font-semibold uppercase tracking-wider">Owner / Company</label>
                        <input
                            required
                            className="flex w-full rounded-lg text-workshop-dark focus:outline-0 focus:ring-2 focus:ring-primary border-none bg-white dark:bg-gray-700 dark:text-white h-14 px-4 text-base font-medium shadow-sm"
                            placeholder="Company Name"
                            value={owner}
                            onChange={(e) => setOwner(e.target.value)}
                        />
                    </div>

                    {/* Owner Phone */}
                    <div className="flex flex-col gap-2">
                        <label className="text-workshop-dark dark:text-gray-200 text-sm font-semibold uppercase tracking-wider">Owner Phone No</label>
                        <div className="flex w-full items-stretch rounded-lg shadow-sm overflow-hidden">
                            <input
                                type="tel"
                                className="flex w-full min-w-0 flex-1 border-none focus:outline-0 focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-workshop-dark dark:text-white h-14 px-4 text-base font-medium"
                                placeholder="e.g. 9876543210"
                                value={ownerPhone}
                                onChange={(e) => setOwnerPhone(e.target.value)}
                            />
                            <div className="text-gray-500 bg-white dark:bg-gray-700 dark:text-gray-400 flex items-center justify-center px-4 border-l border-gray-100 dark:border-gray-600">
                                <span className="material-symbols-outlined">phone</span>
                            </div>
                        </div>
                    </div>

                    {/* Type */}
                    <div className="flex flex-col gap-2">
                        <label className="text-workshop-dark dark:text-gray-200 text-sm font-semibold uppercase tracking-wider">Vehicle Type</label>
                        <select
                            className="flex w-full rounded-lg text-workshop-dark focus:outline-0 focus:ring-2 focus:ring-primary border-none bg-white dark:bg-gray-700 dark:text-white h-14 px-4 text-base font-medium shadow-sm"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="Heavy Duty">Heavy Duty</option>
                            <option value="Semi-Trailer">Semi-Trailer</option>
                            <option value="Flatbed">Flatbed</option>
                            <option value="Tanker">Tanker</option>
                        </select>
                    </div>

                    {/* Driver */}
                    <div className="flex flex-col gap-2">
                        <label className="text-workshop-dark dark:text-gray-200 text-sm font-semibold uppercase tracking-wider">Assigned Driver</label>
                        <div className="flex w-full items-stretch rounded-lg shadow-sm overflow-hidden">
                            <input
                                className="flex w-full min-w-0 flex-1 border-none focus:outline-0 focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-workshop-dark dark:text-white h-14 px-4 text-base font-medium"
                                placeholder="Driver Name"
                                value={driver}
                                onChange={(e) => setDriver(e.target.value)}
                            />
                            <div className="text-gray-500 bg-white dark:bg-gray-700 dark:text-gray-400 flex items-center justify-center px-4 border-l border-gray-100 dark:border-gray-600">
                                <span className="material-symbols-outlined">person</span>
                            </div>
                        </div>
                    </div>

                    {/* Driver Phone */}
                    <div className="flex flex-col gap-2">
                        <label className="text-workshop-dark dark:text-gray-200 text-sm font-semibold uppercase tracking-wider">Driver Phone No</label>
                        <div className="flex w-full items-stretch rounded-lg shadow-sm overflow-hidden">
                            <input
                                type="tel"
                                className="flex w-full min-w-0 flex-1 border-none focus:outline-0 focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-workshop-dark dark:text-white h-14 px-4 text-base font-medium"
                                placeholder="e.g. 9876543210"
                                value={driverPhone}
                                onChange={(e) => setDriverPhone(e.target.value)}
                            />
                            <div className="text-gray-500 bg-white dark:bg-gray-700 dark:text-gray-400 flex items-center justify-center px-4 border-l border-gray-100 dark:border-gray-600">
                                <span className="material-symbols-outlined">phone</span>
                            </div>
                        </div>
                    </div>

                    {/* Mileage */}
                    <div className="flex flex-col gap-2">
                        <label className="text-workshop-dark dark:text-gray-200 text-sm font-semibold uppercase tracking-wider">Starting / Current KM</label>
                        <div className="flex w-full items-stretch rounded-lg shadow-sm overflow-hidden">
                            <input
                                type="number"
                                className="flex w-full min-w-0 flex-1 border-none focus:outline-0 focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-workshop-dark dark:text-white h-14 px-4 text-base font-medium"
                                placeholder="0"
                                value={mileage}
                                onChange={(e) => setMileage(e.target.value)}
                            />
                            <div className="text-gray-500 bg-white dark:bg-gray-700 dark:text-gray-400 flex items-center justify-center px-4 border-l border-gray-100 dark:border-gray-600">
                                <span className="font-bold text-sm">KM</span>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="mt-4 w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        <span className="material-symbols-outlined">{submitting ? 'hourglass_top' : 'add_circle'}</span>
                        {submitting ? 'Adding...' : 'Add Vehicle'}
                    </button>
                </form>
            </main>
        </div>
    );
};

export default AddTruck;
