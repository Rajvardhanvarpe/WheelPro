import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllAlignments, fetchAllBills } from '../services/dataService';
import { parseISO } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Reports = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    // Config State
    const [reportType, setReportType] = useState('Alignments'); // 'Alignments' or 'Bills'
    const [timeFrame, setTimeFrame] = useState('Monthly'); // 'Monthly' or 'Yearly'

    // Time Selection State
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Summary State for Bills
    const [summaryStats, setSummaryStats] = useState({ total: 0, paid: 0, balance: 0 });

    const months = [
        "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
        "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
    ];

    const generateReport = async () => {
        setLoading(true);
        try {
            if (reportType === 'Alignments') {
                const allAlignments = await fetchAllAlignments();
                const filteredData = allAlignments.filter(item => {
                    if (!item.alignmentDate) return false;
                    const date = parseISO(item.alignmentDate);

                    if (timeFrame === 'Monthly') {
                        return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
                    } else {
                        const fyStart = new Date(selectedYear - 1, 3, 1);
                        const fyEnd = new Date(selectedYear, 2, 31, 23, 59, 59);
                        return date >= fyStart && date <= fyEnd;
                    }
                });
                setReports(filteredData);
            } else if (reportType === 'Bills') {
                const allBills = await fetchAllBills();
                const filteredData = allBills.filter(item => {
                    if (!item.date) return false;
                    const date = new Date(item.date); // 'YYYY-MM-DD' parses correctly typically, but Date is safer here

                    if (timeFrame === 'Monthly') {
                        return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
                    } else {
                        const fyStart = new Date(selectedYear - 1, 3, 1);
                        const fyEnd = new Date(selectedYear, 2, 31, 23, 59, 59);
                        return date >= fyStart && date <= fyEnd;
                    }
                });

                // Calculate summaries
                let t = 0; let p = 0; let b = 0;
                filteredData.forEach(bill => {
                    t += (bill.totalAmount || 0);
                    p += (bill.advancePaid || 0);
                    b += (bill.balanceDue !== undefined ? bill.balanceDue : bill.totalAmount);
                });

                // Bills fully paid through old UI might just have paymentStatus="Paid" but missing advancePaid.
                // Let's accurately deduce assuming if Status="Paid", advance = total, balance = 0.
                filteredData.forEach(bill => {
                    if (bill.paymentStatus === 'Paid' && !bill.advancePaid) {
                        p += (bill.totalAmount || 0);
                        b -= (bill.totalAmount || 0);
                    }
                });

                // Actually recalculate clean:
                t = 0; p = 0; b = 0;
                filteredData.forEach(bill => {
                    const total = bill.totalAmount || 0;
                    t += total;
                    if (bill.paymentStatus === 'Paid') {
                        p += total;
                    } else {
                        const paid = bill.advancePaid || 0;
                        const bal = bill.balanceDue !== undefined ? bill.balanceDue : total;
                        p += paid;
                        b += bal;
                    }
                });

                setSummaryStats({ total: t, paid: p, balance: b });
                setReports(filteredData);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        generateReport();
    }, [reportType, timeFrame, selectedMonth, selectedYear]);

    // Handlers
    const handlePrevMonth = () => {
        if (selectedMonth === 0) {
            setSelectedMonth(11);
            setSelectedYear(prev => prev - 1);
        } else {
            setSelectedMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (selectedMonth === 11) {
            setSelectedMonth(0);
            setSelectedYear(prev => prev + 1);
        } else {
            setSelectedMonth(prev => prev + 1);
        }
    };

    const handlePrevYear = () => setSelectedYear(prev => prev - 1);
    const handleNextYear = () => setSelectedYear(prev => prev + 1);

    const getReportTitle = () => {
        const timeStr = timeFrame === 'Monthly' ? `${months[selectedMonth]} ${selectedYear}` : `FY ${selectedYear - 1}-${selectedYear}`;
        return `WheelTrack Pro - ${reportType} Report (${timeStr})`;
    };

    const exportPDF = () => {
        if (reports.length === 0) return alert("No reports to export.");

        const doc = new jsPDF();
        doc.text(getReportTitle(), 14, 15);

        let tableColumn = [];
        let tableRows = [];

        if (reportType === 'Alignments') {
            tableColumn = ["Truck No", "Date", "Current KM", "Next Due", "Tech", "Notes"];
            tableRows = reports.map(item => [
                item.truckNumber || item.truckId || "N/A",
                item.alignmentDate || "N/A",
                item.currentKM || item.alignmentKM || "0",
                item.nextDueDate || "N/A",
                item.technician || "N/A",
                item.notes || ""
            ]);
        } else {
            tableColumn = ["Inv No", "Date", "Owner/Truck", "Total (Rs)", "Paid (Rs)", "Bal (Rs)"];
            tableRows = reports.map(item => {
                const total = item.totalAmount || 0;
                let paid = item.advancePaid || 0;
                let bal = item.balanceDue !== undefined ? item.balanceDue : total;
                if (item.paymentStatus === 'Paid') { paid = total; bal = 0; }

                return [
                    item.invoiceNo || "N/A",
                    item.date || "N/A",
                    `${item.truckOwnerName || 'N/A'}\n${item.truckNumber || 'N/A'}`,
                    total.toLocaleString('en-IN'),
                    paid.toLocaleString('en-IN'),
                    bal.toLocaleString('en-IN')
                ];
            });
        }

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [249, 115, 22] } // Primary color
        });

        doc.save(`${reportType}_Report_${timeFrame === 'Monthly' ? months[selectedMonth] : ''}_${selectedYear}.pdf`);
    };

    const exportExcel = () => {
        if (reports.length === 0) return alert("No reports to export.");

        let exportData = [];

        if (reportType === 'Alignments') {
            exportData = reports.map(item => ({
                "Truck Number": item.truckNumber || item.truckId || "N/A",
                "Date": item.alignmentDate || "N/A",
                "Current KM": item.currentKM || item.alignmentKM || "0",
                "Next Due": item.nextDueDate || "N/A",
                "Technician": item.technician || "N/A",
                "Notes": item.notes || ""
            }));
        } else {
            exportData = reports.map(item => {
                const total = item.totalAmount || 0;
                let paid = item.advancePaid || 0;
                let bal = item.balanceDue !== undefined ? item.balanceDue : total;
                if (item.paymentStatus === 'Paid') { paid = total; bal = 0; }

                return {
                    "Invoice No": item.invoiceNo || "N/A",
                    "Date": item.date || "N/A",
                    "Owner Name": item.truckOwnerName || "N/A",
                    "Truck Number": item.truckNumber || "N/A",
                    "Category": item.invoiceCategory || "N/A",
                    "Total Amount": total,
                    "Paid Amount": paid,
                    "Balance Due": bal,
                    "Payment Status": item.paymentStatus || "Unknown"
                };
            });
        }

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, reportType);

        // Use blob-based download (XLSX.writeFile fails in browser environments)
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_Report_${timeFrame === 'Monthly' ? months[selectedMonth] : ''}_${selectedYear}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="dark:bg-background-dark dark:text-gray-100 min-h-screen flex flex-col pb-24">
            <header className="sticky top-0 z-20 bg-background-light dark:bg-background-dark border-b border-form-container dark:border-gray-700">
                <div className="flex items-center p-4 pb-2 justify-between">
                    <div className="text-workshop-dark dark:text-white flex size-12 shrink-0 items-center cursor-pointer" onClick={() => navigate(-1)}>
                        <span className="material-symbols-outlined">chevron_left</span>
                    </div>
                    <h2 className="text-workshop-dark dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
                        Reporting Console
                    </h2>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto pb-24 max-w-7xl mx-auto w-full">
                <section className="mt-4 px-4">
                    {/* Primary Toggles: Alignments vs Bills */}
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4">
                        <button
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${reportType === 'Alignments' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            onClick={() => setReportType('Alignments')}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-sm">build</span>
                                Alignments
                            </span>
                        </button>
                        <button
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${reportType === 'Bills' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            onClick={() => setReportType('Bills')}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-sm">receipt_long</span>
                                Billings
                            </span>
                        </button>
                    </div>

                    {/* Secondary Toggles: Monthly vs Yearly */}
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4">
                        <button
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${timeFrame === 'Monthly' ? 'bg-white dark:bg-gray-600 shadow-sm text-workshop-dark dark:text-white' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            onClick={() => setTimeFrame('Monthly')}
                        >
                            Monthly Report
                        </button>
                        <button
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${timeFrame === 'Yearly' ? 'bg-white dark:bg-gray-600 shadow-sm text-workshop-dark dark:text-white' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            onClick={() => setTimeFrame('Yearly')}
                        >
                            Yearly Report
                        </button>
                    </div>

                    <div className="flex py-2 gap-4">
                        {/* Month Selector (Only if Monthly) */}
                        {timeFrame === 'Monthly' && (
                            <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-form-container dark:border-gray-700">
                                <button onClick={handlePrevMonth} className="text-gray-400 dark:text-gray-500 text-xs font-bold leading-normal tracking-[0.015em] flex h-10 items-center justify-center border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <span className="material-symbols-outlined text-sm">expand_less</span>
                                </button>
                                <p className="text-workshop-dark dark:text-white text-sm font-bold leading-normal tracking-[0.015em] flex h-12 items-center justify-center bg-gray-50 dark:bg-gray-700">
                                    {months[selectedMonth]}
                                </p>
                                <button onClick={handleNextMonth} className="text-gray-400 dark:text-gray-500 text-xs font-bold leading-normal tracking-[0.015em] flex h-10 items-center justify-center border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <span className="material-symbols-outlined text-sm">expand_more</span>
                                </button>
                            </div>
                        )}

                        {/* Year Selector */}
                        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-form-container dark:border-gray-700">
                            <button onClick={handlePrevYear} className="text-gray-400 dark:text-gray-500 text-xs font-bold leading-normal tracking-[0.015em] flex h-10 items-center justify-center border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <span className="material-symbols-outlined text-sm">expand_less</span>
                            </button>
                            <p className="text-workshop-dark dark:text-white text-sm font-bold leading-normal tracking-[0.015em] flex h-12 items-center justify-center bg-gray-50 dark:bg-gray-700">
                                {timeFrame === 'Yearly' ? `FY ${selectedYear - 1}-${selectedYear}` : selectedYear}
                            </p>
                            <button onClick={handleNextYear} className="text-gray-400 dark:text-gray-500 text-xs font-bold leading-normal tracking-[0.015em] flex h-10 items-center justify-center border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <span className="material-symbols-outlined text-sm">expand_more</span>
                            </button>
                        </div>
                    </div>
                </section>

                <section className="mt-4 px-4">
                    {reportType === 'Bills' && !loading && reports.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl border border-orange-100 dark:border-orange-900">
                                <p className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400 mb-1 tracking-wider">Total Billed</p>
                                <p className="text-sm md:text-base font-black text-orange-700 dark:text-orange-300">₹{summaryStats.total.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-100 dark:border-green-900">
                                <p className="text-[10px] uppercase font-bold text-green-600 dark:text-green-400 mb-1 tracking-wider">Total Recv</p>
                                <p className="text-sm md:text-base font-black text-green-700 dark:text-green-300">₹{summaryStats.paid.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900">
                                <p className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400 mb-1 tracking-wider">Pending</p>
                                <p className="text-sm md:text-base font-black text-red-700 dark:text-red-300">₹{summaryStats.balance.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    )}

                    <div className="pb-4">
                        <h3 className="text-workshop-dark dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Report Data</h3>
                        <p className="text-xs text-primary font-bold uppercase tracking-wider mt-1">{reports.length} Records Found</p>
                    </div>

                    <div className="flex flex-col gap-3">
                        {loading ? <div className="text-center p-4">Loading...</div> : reports.length === 0 ? <div className="text-center p-4 text-gray-500">No records found for this period.</div> : reports.map((item) => (
                            <div key={item.id} className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-form-container dark:border-gray-700`}>
                                {reportType === 'Alignments' ? (
                                    <>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-base font-bold text-workshop-dark dark:text-white">{item.truckNumber || item.truckId || item.id}</span>
                                            <span className={`text-sm font-bold text-emerald-600 flex items-center gap-1`}>
                                                Due: {item.nextDueDate || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-end border-t border-gray-50 dark:border-gray-700 pt-2">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{item.technician || 'Unknown Tech'}</span>
                                                <span className="text-[10px] text-gray-400 dark:text-gray-500">Date: {item.alignmentDate || 'N/A'}</span>
                                            </div>
                                            <span className="text-[11px] text-gray-400 dark:text-gray-500 font-bold">
                                                {item.currentKM || item.alignmentKM || '0'} KM
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-workshop-dark dark:text-white">Inv: {item.invoiceNo}</span>
                                                <span className="text-xs font-bold text-gray-500">{item.truckNumber || 'N/A'}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-base font-black text-red-500">
                                                    ₹{item.totalAmount?.toLocaleString('en-IN') || 0}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-end border-t border-gray-50 dark:border-gray-700 pt-2">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase">Owner</span>
                                                <span className="text-xs font-bold text-workshop-dark dark:text-white">{item.truckOwnerName || 'N/A'}</span>
                                                <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Date: {item.date || 'N/A'}</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                {item.paymentStatus === 'Paid' ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Paid in Full</span>
                                                ) : (
                                                    <>
                                                        <span className="text-[10px] font-bold text-green-600 dark:text-green-400">Paid: ₹{item.advancePaid?.toLocaleString('en-IN') || 0}</span>
                                                        <span className="text-[10px] font-bold text-red-600 dark:text-red-400">Bal: ₹{(item.balanceDue !== undefined ? item.balanceDue : item.totalAmount)?.toLocaleString('en-IN') || 0}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3 py-6 mb-12">
                        <button onClick={exportPDF} disabled={reports.length === 0} className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg border-2 border-primary bg-white dark:bg-gray-800 text-primary font-bold text-sm active:bg-gray-50 dark:active:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            <span className="material-symbols-outlined text-xl">picture_as_pdf</span>
                            Export PDF
                        </button>
                        <button onClick={exportExcel} disabled={reports.length === 0} className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg border-2 border-primary bg-white dark:bg-gray-800 text-primary font-bold text-sm active:bg-gray-50 dark:active:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            <span className="material-symbols-outlined text-xl">table_view</span>
                            Export Excel
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Reports;
