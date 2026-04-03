import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveBill, getNextInvoiceNumber } from '../services/dataService';

const Billing = () => {
    const navigate = useNavigate();

    // Invoice State
    const [invoiceNo, setInvoiceNo] = useState('...');

    useEffect(() => {
        const fetchInvoiceNumber = async () => {
            // Clear any stale dev seed value (INV-1001) left in localStorage
            const cached = localStorage.getItem('lastInvoiceNo');
            if (cached && cached === 'INV-1001') {
                localStorage.removeItem('lastInvoiceNo');
            }
            const nextNo = await getNextInvoiceNumber();
            setInvoiceNo(nextNo);
        };
        fetchInvoiceNumber();
    }, []);
    const [truckNumber, setTruckNumber] = useState('');
    const [truckOwnerName, setTruckOwnerName] = useState('');
    const [ownerMobNo, setOwnerMobNo] = useState('');
    const [altOwnerMobNo, setAltOwnerMobNo] = useState('');
    const [truckDriverName, setTruckDriverName] = useState('');
    const [driverMobNo, setDriverMobNo] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [invoiceCategory, setInvoiceCategory] = useState('1: Alignment');
    const [paymentStatus, setPaymentStatus] = useState('Paid');
    const [saved, setSaved] = useState(false);

    // Items State
    const [items, setItems] = useState([
        { id: 1, particulars: '', quantity: 1, amount: 0 }
    ]);

    // Total Amount State & Logic
    const [totalAmount, setTotalAmount] = useState(0);
    const [isTotalManual, setIsTotalManual] = useState(false);

    useEffect(() => {
        if (!isTotalManual) {
            const calculatedTotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
            setTotalAmount(calculatedTotal);
        }
    }, [items, isTotalManual]);

    const handleTotalChange = (e) => {
        setIsTotalManual(true);
        setTotalAmount(Number(e.target.value) || 0);
    };

    const handleAddItem = () => {
        setItems([
            ...items,
            { id: items.length + 1, particulars: '', quantity: 1, amount: 0 }
        ]);
    };

    const handleRemoveItem = (idToRemove) => {
        if (items.length === 1) return; // Keep at least one row
        const newItems = items.filter(item => item.id !== idToRemove)
            // Re-index SR.NO
            .map((item, index) => ({ ...item, id: index + 1 }));
        setItems(newItems);
    };

    const handleChange = (id, field, value) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleCategoryChange = (e) => {
        setInvoiceCategory(e.target.value);
        // Reset all particulars when category changes to prevent mismatch
        setItems(items.map(item => ({ ...item, particulars: '' })));
    };

    const handleSaveInvoice = async () => {
        if (!truckNumber) {
            alert("Please enter a Truck Number before saving.");
            return;
        }

        const billData = {
            invoiceNo,
            truckNumber,
            truckOwnerName,
            ownerMobNo,
            altOwnerMobNo,
            truckDriverName,
            driverMobNo,
            date,
            invoiceCategory,
            items,
            totalAmount,
            paymentStatus
        };

        try {
            await saveBill(billData);
            setSaved(true);
            setTimeout(() => setSaved(false), 4000);
        } catch (error) {
            alert("Failed to save invoice. Please try again.");
            console.error(error);
        }
    };

    const handleSaveAndPrint = async () => {
        if (!truckNumber) {
            alert("Please enter a Truck Number before saving.");
            return;
        }
        await handleSaveInvoice();
        // Small delay so the toast shows before print dialog opens
        setTimeout(() => window.print(), 300);
    };

    return (
        <div className="dark:bg-background-dark dark:text-gray-100 min-h-screen print:min-h-0 flex flex-col pb-24 print:pb-0 font-sans">
            <header className="sticky top-0 z-20 bg-background-light dark:bg-background-dark border-b border-form-container dark:border-gray-700 print:hidden">
                <div className="flex items-center p-4 pb-2 justify-between">
                    <div className="text-workshop-dark dark:text-white flex size-12 shrink-0 items-center cursor-pointer md:hidden" onClick={() => navigate(-1)}>
                        <span className="material-symbols-outlined">chevron_left</span>
                    </div>
                    <div className="hidden md:flex size-12 shrink-0 items-center"></div>
                    <h2 className="text-workshop-dark dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center md:text-left md:pr-0 pr-12">
                        Billing & Invoice Generator
                    </h2>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto print:overflow-visible w-full max-w-5xl mx-auto p-4 md:p-6 pb-24 print:p-0 print:pb-0">
                <div className="bg-white dark:bg-gray-800 print:bg-white rounded-2xl print:rounded-none shadow-sm print:shadow-none border border-form-container dark:border-gray-700 print:border-none overflow-hidden print:overflow-visible text-workshop-dark">

                    {/* Business Header */}
                    <div className="p-4 print:p-2 border-b border-gray-200 bg-white flex items-center justify-between gap-2 md:gap-4 rounded-t-2xl print:rounded-none">
                        {/* Left Logo */}
                        <div className="flex-shrink-0 flex items-center justify-center pl-2 md:pl-4">
                            <img src="/logo-left.jpg" alt="Left Logo" className="h-12 md:h-20 w-auto object-contain mix-blend-multiply" />
                        </div>

                        {/* Center Text */}
                        <div className="text-center flex-1">
                            <h1 className="text-lg md:text-3xl font-black text-workshop-dark tracking-wider mb-1 uppercase">
                                G.JADHAV ENTERPRISES
                            </h1>
                            <p className="text-[10px] md:text-sm font-semibold text-gray-800 mb-0.5">
                                Address - 783, Gokul Shirgoan Road, Next To Tata Motors, Kolhapur
                            </p>
                            <p className="text-[10px] md:text-sm font-bold text-gray-600 flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-[12px] md:text-[16px]">call</span>
                                982 277 2700, 88770 01888
                            </p>
                        </div>

                        {/* Right Logo */}
                        <div className="flex-shrink-0 flex items-center justify-center pr-2 md:pr-4">
                            <img src="/logo-right.jpg" alt="Right Logo" className="h-14 md:h-24 w-auto object-contain mix-blend-multiply" />
                        </div>
                    </div>

                    {/* Invoice Header Details */}
                    <div className="p-6 bg-gray-50 dark:bg-gray-700/50 print:bg-white border-b border-gray-100 dark:border-gray-700 print:p-2">

                        {/* Top Row: Date and Category */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 print:mb-3 gap-4">
                            <div className="w-full md:w-48 print:hidden">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Category</label>
                                <select
                                    value={invoiceCategory}
                                    onChange={handleCategoryChange}
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-workshop-dark dark:text-white font-bold focus:ring-primary focus:border-primary"
                                >
                                    <option value="1: Alignment">1: Alignment</option>
                                    <option value="2: Leaf spring work">2: Leaf spring work</option>
                                </select>
                            </div>
                        </div>

                        {/* Line 1: Truck No, Driver Name, Driver Mob No, Invoice No */}
                        <div className="flex flex-row md:grid md:grid-cols-4 w-full gap-2 md:gap-6 print:gap-4 mb-3 md:mb-6 print:mb-3">
                            <div className="flex-1">
                                <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Truck Number</label>
                                <input
                                    type="text"
                                    value={truckNumber}
                                    onChange={(e) => setTruckNumber(e.target.value.toUpperCase())}
                                    placeholder="MH 43 BX 1234"
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base text-workshop-dark dark:text-white font-bold focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Truck Driver Name</label>
                                <input
                                    type="text"
                                    value={truckDriverName}
                                    onChange={(e) => setTruckDriverName(e.target.value)}
                                    placeholder="Driver Name"
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base text-workshop-dark dark:text-white font-bold focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Driver Mob.No</label>
                                <input
                                    type="tel"
                                    value={driverMobNo}
                                    onChange={(e) => setDriverMobNo(e.target.value)}
                                    placeholder="Mobile Number"
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base text-workshop-dark dark:text-white font-bold focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div className="flex-1 text-right">
                                <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Invoice No</label>
                                <div className="text-xl md:text-2xl font-black text-primary bg-transparent border-none p-0 flex items-center justify-end">{invoiceNo}</div>
                            </div>
                        </div>

                        {/* Line 2: Owner Name, Owner Mob No, Alt Mob No, Date */}
                        <div className="flex flex-row md:grid md:grid-cols-4 w-full gap-2 md:gap-6 print:gap-4">
                            <div className="flex-1">
                                <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Owner Name</label>
                                <input
                                    type="text"
                                    value={truckOwnerName}
                                    onChange={(e) => setTruckOwnerName(e.target.value)}
                                    placeholder="Owner Name"
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base text-workshop-dark dark:text-white font-bold focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Owner Mob.No</label>
                                <input
                                    type="tel"
                                    value={ownerMobNo}
                                    onChange={(e) => setOwnerMobNo(e.target.value)}
                                    placeholder="Mobile 1"
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base text-workshop-dark dark:text-white font-bold focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Alt Mob.No</label>
                                <input
                                    type="tel"
                                    value={altOwnerMobNo}
                                    onChange={(e) => setAltOwnerMobNo(e.target.value)}
                                    placeholder="Mobile 2"
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base text-workshop-dark dark:text-white font-bold focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base text-workshop-dark dark:text-white font-bold focus:ring-primary focus:border-primary leading-tight"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Double Line Separator */}
                    <div className="w-full flex md:px-6 print:px-2 py-2 print:py-1 flex-col gap-[2px]">
                        <div className="w-full h-[2px] bg-workshop-dark"></div>
                        <div className="w-full h-[2px] bg-workshop-dark"></div>
                    </div>

                    {/* Invoice Table */}
                    <div className="p-6 print:p-2 overflow-x-auto print:overflow-hidden">
                        <table className="w-full text-left border-collapse min-w-[600px] print:min-w-0">
                            <thead>
                                <tr className="border-b-2 border-gray-200 dark:border-gray-600">
                                    <th className="py-3 print:py-1 px-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-16 print:w-12 text-center">SR.NO</th>
                                    <th className="py-3 print:py-1 px-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">PARTICULARS</th>
                                    <th className="py-3 print:py-1 px-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-24 print:w-20 text-center">QUANTITY</th>
                                    <th className="py-3 print:py-1 px-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-32 print:w-28 text-right">AMOUNT (₹)</th>
                                    <th className="py-3 print:py-1 px-2 w-12 text-center print:hidden"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {items.map((item) => (
                                    <tr key={item.id} className="group flex flex-col md:table-row print:table-row w-full border-b md:border-b-0 print:border-b-0 border-gray-100 dark:border-gray-700 pb-4 md:pb-0 print:pb-0">
                                        <td className="hidden md:table-cell print:table-cell py-3 print:py-1 px-2 text-center font-bold text-gray-400 dark:text-gray-500">{item.id}</td>

                                        <td className="py-2 print:py-0 md:py-3 px-4 md:px-2 w-full md:w-auto print:w-auto block md:table-cell print:table-cell">
                                            <div className="md:hidden print:hidden text-xs font-bold text-gray-500 mb-1">PARTICULARS</div>
                                            <input
                                                type="text"
                                                list={`services-list-${item.id}`}
                                                value={item.particulars}
                                                onChange={(e) => handleChange(item.id, 'particulars', e.target.value)}
                                                placeholder={invoiceCategory === '1: Alignment' ? "e.g. Front toe adjust" : "e.g. Rear center bolt change"}
                                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-workshop-dark dark:text-white font-semibold text-sm focus:ring-primary focus:border-primary"
                                            />
                                            <datalist id={`services-list-${item.id}`}>
                                                {invoiceCategory === '1: Alignment' && (
                                                    <>
                                                        <option value=" Front toe adjust" />
                                                        <option value=" Front 2nd toe adjust" />
                                                        <option value=" Parallelism adjust" />
                                                        <option value=" Lift axle toe adjust" />
                                                        <option value=" Rear thrust angle adjust" />
                                                        <option value=" Rear scrub angle adjust" />
                                                        <option value=" Tag axle toe adjust" />
                                                    </>
                                                )}
                                                {invoiceCategory === '2: Leaf spring work' && (
                                                    <>
                                                        <option value=" Rear center bolt change" />
                                                        <option value=" Front center bolt change" />
                                                        <option value=" Rear leaf change and fitting" />
                                                        <option value=" Front leaf change and fitting" />
                                                        <option value=" Left axle work(2 leg bush)Benz" />
                                                        <option value=" Left axle work TATA" />
                                                        <option value=" Left axle work Leyland" />
                                                        <option value=" Left axle work - 16 tyre-(BIG BUSH)" />
                                                    </>
                                                )}
                                            </datalist>
                                        </td>

                                        <td className="py-2 print:py-0 md:py-3 px-4 md:px-2 w-full md:w-auto print:w-auto block md:table-cell print:table-cell text-left md:text-center print:text-center">
                                            <div className="flex items-center justify-between md:justify-center print:justify-center">
                                                <div className="md:hidden print:hidden text-xs font-bold text-gray-500">QUANTITY</div>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                                    className="w-20 md:w-16 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-center px-1 py-1 text-workshop-dark dark:text-white font-bold"
                                                />
                                            </div>
                                        </td>

                                        <td className="py-2 print:py-0 md:py-3 px-4 md:px-2 w-full md:w-auto print:w-auto block md:table-cell print:table-cell text-left md:text-right print:text-right">
                                            <div className="flex items-center justify-between md:justify-end print:justify-end">
                                                <div className="md:hidden print:hidden text-xs font-bold text-gray-500">AMOUNT (₹)</div>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={item.amount || ''}
                                                    onChange={(e) => handleChange(item.id, 'amount', parseFloat(e.target.value))}
                                                    placeholder="0.00"
                                                    className="w-24 md:w-24 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-right px-2 py-1 text-workshop-dark dark:text-white font-black"
                                                />
                                            </div>
                                        </td>

                                        <td className="py-2 md:py-3 px-4 md:px-2 w-full md:w-auto block md:table-cell text-right md:text-center">
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                disabled={items.length === 1}
                                                className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-20 inline-flex items-center justify-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg md:bg-transparent print:hidden"
                                                title="Remove Row"
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                                <span className="md:hidden ml-1 text-sm font-bold">Remove Item</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <button
                            onClick={handleAddItem}
                            className="mt-4 flex items-center gap-1 text-primary font-bold text-sm hover:underline print:hidden"
                        >
                            <span className="material-symbols-outlined text-base">add_circle</span>
                            Add Row
                        </button>
                    </div>

                    {/* Invoice Footer / Total Amount */}
                    <div className="p-6 print:p-2 bg-gray-50 print:bg-white dark:bg-gray-700/50 flex flex-col md:flex-row print:flex-row justify-between items-end gap-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="w-full md:w-1/2">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Notes / Terms</label>
                            <textarea
                                rows="2"
                                placeholder="Thank you for your business."
                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-workshop-dark dark:text-white text-sm focus:ring-primary focus:border-primary resize-none"
                            ></textarea>
                        </div>

                        <div className="w-full md:w-[300px] print:w-[250px] bg-workshop-dark print:bg-white text-white print:text-workshop-dark rounded-xl print:rounded-none p-4 print:p-2 shadow-lg print:shadow-none border-t-2 print:border-gray-800">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-gray-400 font-bold uppercase tracking-wider text-sm">Total Amount</span>
                            </div>
                            <div className="flex items-center gap-1 border-b border-gray-500/50 pb-1">
                                <span className="text-3xl font-black">₹</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={totalAmount || ''}
                                    onChange={handleTotalChange}
                                    className="bg-transparent text-3xl font-black text-white w-full outline-none placeholder-gray-400"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Signature Block */}
                    <div className="p-6 print:p-4 bg-white dark:bg-gray-800 flex justify-end">
                        <div className="text-center mt-4">
                            <h3 className="font-bold text-workshop-dark dark:text-gray-300 text-sm mb-12">For G.JADHAV ENTERPRISES</h3>
                            <p className="font-semibold text-gray-500 text-xs border-gray-300 dark:border-gray-600 pt-1">Propriotor / Authorised Signatory</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-col md:flex-row justify-end items-center gap-4 print:hidden">
                    {/* Success Toast */}
                    {saved && (
                        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-xl px-4 py-2 text-sm font-bold animate-pulse">
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            Invoice saved as <span className="underline">{paymentStatus}</span>!
                        </div>
                    )}

                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-4 h-12">
                        <label className="text-sm font-bold text-gray-500 dark:text-gray-400">Payment Status:</label>
                        <select
                            value={paymentStatus}
                            onChange={(e) => setPaymentStatus(e.target.value)}
                            className={`font-black outline-none bg-transparent ${paymentStatus === 'Pending' ? 'text-red-500' : 'text-green-500'}`}
                        >
                            <option value="Paid" className="text-green-500">Paid</option>
                            <option value="Pending" className="text-red-500">Pending</option>
                        </select>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => window.print()} className="h-12 px-5 rounded-xl border-2 border-primary text-primary font-bold hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined">print</span>
                            Print
                        </button>
                        <button onClick={handleSaveInvoice} className="h-12 px-5 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined">save</span>
                            Save Only
                        </button>
                        <button onClick={handleSaveAndPrint} className="h-12 px-6 rounded-xl bg-primary text-white font-bold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined">print</span>
                            Save &amp; Print
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Billing;
