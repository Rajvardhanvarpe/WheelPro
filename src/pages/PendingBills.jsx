import React, { useState, useEffect } from 'react';
import { getPendingBills, markBillPaid, addPartialPayment } from '../services/dataService';
import { useNavigate } from 'react-router-dom';

const PendingBills = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Payment Modal State
    const [paymentModalBill, setPaymentModalBill] = useState(null);
    const [paymentInputAmount, setPaymentInputAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        setLoading(true);
        try {
            const fetchedBills = await getPendingBills();
            setBills(fetchedBills);
        } catch (error) {
            console.error("Failed to load pending bills:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkPaid = async (billId, invoiceNo) => {
        if (window.confirm(`Are you sure you want to mark Invoice ${invoiceNo} as Paid?`)) {
            try {
                await markBillPaid(billId);
                // Refresh list
                setBills(bills.filter(b => b.id !== billId));
                alert(`Invoice ${invoiceNo} successfully marked as Paid.`);
            } catch (error) {
                alert("Failed to update bill status.");
            }
        }
    };

    const handleAddPaymentClick = (bill) => {
        setPaymentModalBill(bill);
        setPaymentInputAmount('');
    };

    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        if (!paymentInputAmount || isNaN(paymentInputAmount) || Number(paymentInputAmount) <= 0) {
            alert("Please enter a valid payment amount.");
            return;
        }

        const amountToPay = Number(paymentInputAmount);
        const currentBalance = paymentModalBill.balanceDue !== undefined
            ? paymentModalBill.balanceDue
            : paymentModalBill.totalAmount;

        if (amountToPay > currentBalance) {
            alert(`Payment cannot exceed the remaining balance of ₹${currentBalance}`);
            return;
        }

        setIsProcessing(true);
        try {
            const newStatus = await addPartialPayment(
                paymentModalBill.id,
                paymentModalBill.advancePaid,
                amountToPay,
                paymentModalBill.totalAmount
            );

            if (newStatus === "Paid") {
                // Remove from pending list
                setBills(bills.filter(b => b.id !== paymentModalBill.id));
                alert(`Invoice ${paymentModalBill.invoiceNo} is now fully paid!`);
            } else {
                // Update bill in list with new advance/balance
                setBills(bills.map(b => {
                    if (b.id === paymentModalBill.id) {
                        const newAdvance = (b.advancePaid || 0) + amountToPay;
                        return {
                            ...b,
                            advancePaid: newAdvance,
                            balanceDue: b.totalAmount - newAdvance
                        };
                    }
                    return b;
                }));
                alert(`Payment of ₹${amountToPay} recorded successfully.`);
            }

            setPaymentModalBill(null);
        } catch (error) {
            alert("Failed to record payment.");
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredBills = bills.filter(bill => {
        const term = searchTerm.toLowerCase();
        const ownerMatch = (bill.truckOwnerName || '').toLowerCase().includes(term);
        const truckMatch = (bill.truckNumber || '').toLowerCase().includes(term);
        return ownerMatch || truckMatch;
    });

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 h-full flex flex-col">
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-workshop-dark dark:text-white tracking-tight flex items-center gap-2">
                        <span className="material-symbols-outlined text-3xl text-primary">receipt_long</span>
                        Pending Bills
                    </h1>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">Manage unpaid workshop invoices</p>
                </div>

                <div className="relative w-full md:w-72 mt-4 md:mt-0">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    <input
                        type="text"
                        placeholder="Search Owner or Truck No..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#1a110a] border border-[#ead9cd] dark:border-[#3d2b1d] rounded-xl text-workshop-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                </div>
            </header>

            {loading ? (
                <div className="flex-1 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary"></div>
                </div>
            ) : bills.length === 0 ? (
                <div className="bg-white dark:bg-[#1a110a] rounded-3xl p-12 text-center border border-[#ead9cd] dark:border-[#3d2b1d] shadow-sm flex-1 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4 text-green-500">
                        <span className="material-symbols-outlined text-4xl">check_circle</span>
                    </div>
                    <h3 className="text-xl font-black text-[#1d130c] dark:text-white mb-2">No Pending Bills!</h3>
                    <p className="text-[#a16d45] dark:text-[#c08d65] max-w-sm mb-6 font-medium">All generated invoices have been paid up. Great job collecting payments!</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-[#1a110a] rounded-xl overflow-hidden border border-[#ead9cd] dark:border-[#3d2b1d] shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-[#ead9cd] dark:border-[#3d2b1d]">
                                    <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-gray-500">Invoice No</th>
                                    <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-gray-500">Date</th>
                                    <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-gray-500">Owner & Truck</th>
                                    <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-gray-500">Category</th>
                                    <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-gray-500 text-right">Amount</th>
                                    <th className="py-4 px-4 text-center"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#ead9cd] dark:divide-[#3d2b1d]">
                                {filteredBills.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-gray-500 font-medium">
                                            No pending bills found matching "{searchTerm}"
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBills.map((bill) => (
                                        <tr key={bill.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <span className="font-bold text-workshop-dark dark:text-white">{bill.invoiceNo}</span>
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500 font-semibold">
                                                {bill.date}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="font-bold text-workshop-dark dark:text-white">{bill.truckOwnerName || 'Unknown Owner'}</div>
                                                <div className="text-xs font-semibold text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                                                    {bill.truckNumber || 'N/A'}
                                                </div>
                                                {(bill.ownerMobNo || bill.altOwnerMobNo) && (
                                                    <div className="text-xs font-semibold text-gray-500 flex items-center gap-1 mt-0.5">
                                                        <span className="material-symbols-outlined text-[14px]">phone</span>
                                                        {bill.ownerMobNo} {bill.altOwnerMobNo ? `/ ${bill.altOwnerMobNo}` : ''}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                                                    {bill.invoiceCategory}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap text-right">
                                                <div className="text-sm font-bold text-gray-400 line-through decoration-1 mb-1">
                                                    Total: ₹{bill.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </div>
                                                {bill.advancePaid > 0 && (
                                                    <div className="text-xs font-bold text-green-500 mb-1">
                                                        Paid: ₹{bill.advancePaid?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </div>
                                                )}
                                                <div className="text-lg font-black text-red-500 bg-red-50 dark:bg-red-900/20 inline-block px-2 py-0.5 rounded-lg border border-red-100 dark:border-red-900">
                                                    Bal: ₹{(bill.balanceDue !== undefined ? bill.balanceDue : bill.totalAmount)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                            <td className="py-2 px-4 whitespace-nowrap text-right">
                                                <div className="flex flex-col gap-2 items-end">
                                                    <button
                                                        onClick={() => handleAddPaymentClick(bill)}
                                                        className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 px-4 py-1.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 justify-center w-36"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">payments</span>
                                                        Add Payment
                                                    </button>
                                                    <button
                                                        onClick={() => handleMarkPaid(bill.id, bill.invoiceNo)}
                                                        className="bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 px-4 py-1.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 justify-center w-36"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                                        Fully Paid
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {paymentModalBill && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-100 dark:border-gray-700 transform transition-all">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-workshop-dark dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">payments</span>
                                Record Payment
                            </h3>
                            <button onClick={() => setPaymentModalBill(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6 border border-gray-100 dark:border-gray-600">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-bold text-gray-500">Invoice:</span>
                                <span className="text-sm font-black text-workshop-dark dark:text-white">{paymentModalBill.invoiceNo}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-bold text-gray-500">Owner:</span>
                                <span className="text-sm font-black text-workshop-dark dark:text-white">{paymentModalBill.truckOwnerName || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-bold text-gray-500">Total Amount:</span>
                                <span className="text-sm font-black text-gray-600 dark:text-gray-300">₹{paymentModalBill.totalAmount?.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600 mt-2">
                                <span className="text-sm font-black text-red-500 uppercase tracking-wider">Remaining Bal:</span>
                                <span className="text-lg font-black text-red-600 dark:text-red-400">
                                    ₹{(paymentModalBill.balanceDue !== undefined ? paymentModalBill.balanceDue : paymentModalBill.totalAmount)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitPayment}>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Payment Amount Received (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-gray-400">₹</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max={paymentModalBill.balanceDue !== undefined ? paymentModalBill.balanceDue : paymentModalBill.totalAmount}
                                        value={paymentInputAmount}
                                        onChange={(e) => setPaymentInputAmount(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-xl font-black text-workshop-dark dark:text-white focus:ring-primary focus:border-primary placeholder-gray-300 outline-none transition-colors"
                                        placeholder="0.00"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPaymentModalBill(null)}
                                    className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-bold rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="flex-1 py-3 px-4 bg-primary hover:bg-orange-600 text-white font-black rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {isProcessing ? (
                                        <span className="material-symbols-outlined animate-spin">refresh</span>
                                    ) : (
                                        <span className="material-symbols-outlined">save</span>
                                    )}
                                    {isProcessing ? 'Saving...' : 'Save Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingBills;
