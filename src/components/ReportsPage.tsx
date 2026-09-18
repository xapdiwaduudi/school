import React, { useState } from 'react';
import { AttendanceRecord } from '../types';
import { FileSpreadsheet, Printer, ArrowUpDown } from 'lucide-react';

interface ReportsPageProps {
  attendance: AttendanceRecord[];
}

export default function ReportsPage({ attendance }: ReportsPageProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Dynamic filter logic
  const filteredRecords = attendance.filter(rec => {
    const fromMatch = !dateFrom || rec.date >= dateFrom;
    const toMatch = !dateTo || rec.date <= dateTo;
    const classMatch = selectedClass === 'All' || rec.form === selectedClass;
    const statusMatch = selectedStatus === 'All' || rec.status === selectedStatus;
    return fromMatch && toMatch && classMatch && statusMatch;
  });

  // Calculate top stats
  let topPresentStudent = 'N/A';
  let topAbsentStudent = 'N/A';

  if (attendance.length > 0) {
    const counts = attendance.reduce((acc: { [name: string]: number }, curr) => {
      acc[curr.name] = (acc[curr.name] || 0) + (curr.status === 'present' ? 1 : -1);
      return acc;
    }, {});

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      topPresentStudent = sorted[0][0];
      topAbsentStudent = sorted[sorted.length - 1][0];
    }
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs no-print">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold font-display text-slate-900">Warbixinta Xaadirinta (Reports)</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Laga Bilaabo (From)</label>
            <input 
              type="date" 
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ilaa (To)</label>
            <input 
              type="date" 
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Dooro Class</label>
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors"
            >
              <option value="All">Dhammaan Class-yada</option>
              {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Status</label>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors"
            >
              <option value="All">Dhammaan (All)</option>
              <option value="present">Jooga (Present)</option>
              <option value="absent">Maqan (Absent)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top statistics overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-red-400 to-red-600 text-white p-5 rounded-xl shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider opacity-90">Ardayga Maqnaanshaha Badan</span>
          <span className="text-2xl font-black block mt-2 font-display">{topAbsentStudent}</span>
        </div>

        <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white p-5 rounded-xl shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider opacity-90">Ardayga Joogista Badan</span>
          <span className="text-2xl font-black block mt-2 font-display">{topPresentStudent}</span>
        </div>
      </div>

      {/* Records Table Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
          <div>
            <h3 className="text-lg font-bold font-display text-slate-900">Attendance Report Table</h3>
            <p className="text-xs text-slate-400 mt-1">Sifeyn ku saleysan filterka: {filteredRecords.length} records found</p>
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors shadow-sm no-print cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <ArrowUpDown className="w-12 h-12 mx-auto stroke-1 mb-3 animate-bounce" />
            <p className="text-sm">Xogta xaadirinta lama helin.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-slate-50 text-[#042954] text-xs font-bold uppercase border-b border-slate-100">
                  <th className="p-4">Taariikh</th>
                  <th className="p-4">Magaca Ardayga</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {filteredRecords.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono font-medium text-[#042954]">{r.date}</td>
                    <td className="p-4 font-bold text-slate-950">{r.name}</td>
                    <td className="p-4">{r.form}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider ${
                        r.status === 'present' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {r.status === 'present' ? 'Jooga' : 'Maqan'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
