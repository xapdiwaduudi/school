import React, { useState, useEffect } from 'react';
import { Student, AttendanceRecord } from '../types';
import { CalendarCheck, Save, Check, X, ClipboardList, Trash2, Edit3, History, Search } from 'lucide-react';

interface AttendancePageProps {
  students: Student[];
  attendance: AttendanceRecord[];
  setAttendance: (records: AttendanceRecord[]) => void;
  saveData: (updatedAttendance: AttendanceRecord[]) => void;
}

export default function AttendancePage({ students, attendance, setAttendance, saveData }: AttendancePageProps) {
  const [activeTab, setActiveTab] = useState<'record' | 'history'>('record');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  // History search / filters
  const [historyClassFilter, setHistoryClassFilter] = useState('');
  const [historyDateFilter, setHistoryDateFilter] = useState('');
  const [historySearch, setHistorySearch] = useState('');

  // Current selections statuses state: { [studentId]: 'present' | 'absent' }
  const [statuses, setStatuses] = useState<{ [id: string]: 'present' | 'absent' }>({});

  const classStudents = students.filter(s => s.form === selectedClass);

  // Initialize all to 'present' whenever class changes
  useEffect(() => {
    const initialStatuses: { [id: string]: 'present' | 'absent' } = {};
    classStudents.forEach(s => {
      initialStatuses[s.id] = 'present';
    });
    setStatuses(initialStatuses);
  }, [selectedClass, students]);

  const toggleStatus = (studentId: string, status: 'present' | 'absent') => {
    setStatuses(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = () => {
    if (!selectedClass) {
      alert("Fadlan dooro class!");
      return;
    }
    if (!selectedDate) {
      alert("Fadlan taariikhda geli!");
      return;
    }

    if (classStudents.length === 0) {
      alert("Class-kan wax arday ah kuma qorna!");
      return;
    }

    // Prepare records
    const newRecords: AttendanceRecord[] = classStudents.map(s => ({
      id: s.id,
      name: s.name,
      form: s.form,
      date: selectedDate,
      status: statuses[s.id] || 'present'
    }));

    const filteredHistory = attendance.filter(
      rec => !(rec.date === selectedDate && rec.form === selectedClass)
    );

    const updated = [...filteredHistory, ...newRecords];
    setAttendance(updated);
    saveData(updated);

    alert("Xaadirinta waa la xereeyey!");
  };

  // Toggle or edit attendance record in history
  const handleToggleHistoryRecord = (index: number) => {
    const updated = [...attendance];
    const current = updated[index];
    if (current) {
      updated[index] = {
        ...current,
        status: current.status === 'present' ? 'absent' : 'present'
      };
      setAttendance(updated);
      saveData(updated);
    }
  };

  // Delete attendance record
  const handleDeleteHistoryRecord = (index: number) => {
    if (confirm("Ma hubtaa inaad tirtirto diiwaankan xaadirinta?")) {
      const updated = attendance.filter((_, idx) => idx !== index);
      setAttendance(updated);
      saveData(updated);
    }
  };

  // Clear attendance for filtered date & class
  const handleClearFilteredHistory = () => {
    if (!historyClassFilter && !historyDateFilter) {
      alert("Fadlan dooro class ama taariikh aad rabto inaad tirtirto.");
      return;
    }
    if (confirm("Ma hubtaa inaad tirtirto dhammaan diiwaannada la sifeeyey?")) {
      const updated = attendance.filter(rec => {
        const matchesClass = !historyClassFilter || rec.form === historyClassFilter;
        const matchesDate = !historyDateFilter || rec.date === historyDateFilter;
        return !(matchesClass && matchesDate);
      });
      setAttendance(updated);
      saveData(updated);
    }
  };

  // Filtered history
  const filteredAttendance = attendance.map((item, originalIndex) => ({ ...item, originalIndex }))
    .filter(rec => {
      if (historyClassFilter && rec.form !== historyClassFilter) return false;
      if (historyDateFilter && rec.date !== historyDateFilter) return false;
      if (historySearch) {
        const q = historySearch.toLowerCase();
        const matchesName = rec.name.toLowerCase().includes(q);
        const matchesId = rec.id.toLowerCase().includes(q);
        if (!matchesName && !matchesId) return false;
      }
      return true;
    });

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('record')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
            activeTab === 'record'
              ? 'bg-[#042954] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CalendarCheck className="w-4 h-4 text-[#ffae01]" />
          <span>Geli Xaadirin Cusub</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#042954] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <History className="w-4 h-4 text-[#ffae01]" />
          <span>Taariikhda Xaadirinta ({attendance.length})</span>
        </button>
      </div>

      {activeTab === 'record' ? (
        <>
          {/* Selection Panel */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold font-display text-slate-900">Xaadirinta Class-ka (Attendance)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Dooro Class</label>
                <select 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-emerald-500 transition-colors"
                >
                  <option value="">-- Xulo Class --</option>
                  {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Taariikhda</label>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Attendance Board */}
          {selectedClass && (
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
              <div className="border-b border-slate-100 pb-4 mb-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-900">
                    Class-ka: <span className="text-emerald-600 font-extrabold">{selectedClass}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Geli xaadirinta taariikhda: {selectedDate}</p>
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">
                  {classStudents.length} Arday
                </span>
              </div>

              {classStudents.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <ClipboardList className="w-12 h-12 mx-auto stroke-1 mb-3" />
                  <p className="text-sm">Class-kan wax arday ah kuma qorna.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {classStudents.map(s => {
                    const currentStatus = statuses[s.id] || 'present';
                    return (
                      <div 
                        key={s.id} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-150 hover:border-amber-300 hover:bg-[#fffcf5]/50 transition-all duration-250"
                      >
                        <div className="flex items-center gap-3">
                          <img src={s.img} alt={s.name} className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-xs" referrerPolicy="no-referrer" />
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{s.name}</h4>
                            <span className="text-xs text-[#042954] font-mono bg-slate-100 px-2 py-0.5 rounded-md font-semibold mt-1 inline-block">ID: {s.id}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleStatus(s.id, 'present')}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer ${
                              currentStatus === 'present'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Jooga (Present)</span>
                          </button>

                          <button
                            onClick={() => toggleStatus(s.id, 'absent')}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer ${
                              currentStatus === 'absent'
                                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Maqan (Absent)</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    onClick={handleSaveAttendance}
                    className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Attendance Now</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* History & Management View */
        <div className="bg-white p-6 rounded-xl border border-slate-150 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold font-display text-slate-900">
                Maamulka & Wax ka bedelka Xaadirinta
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Wax ka bedel (Edit) xaaladda ama tirtir (Delete) diiwaan kasta oo xaadirin ah
              </p>
            </div>
            {(historyClassFilter || historyDateFilter) && (
              <button
                onClick={handleClearFilteredHistory}
                className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Tirtir Diiwaannada la Sifeeyey</span>
              </button>
            )}
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Sifee Class</label>
              <select
                value={historyClassFilter}
                onChange={(e) => setHistoryClassFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
              >
                <option value="">Dhammaan Classes</option>
                {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Sifee Taariikhda</label>
              <input
                type="date"
                value={historyDateFilter}
                onChange={(e) => setHistoryDateFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Raadi Arday</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Magac ama ID..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          {filteredAttendance.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <ClipboardList className="w-10 h-10 mx-auto stroke-1 mb-2" />
              <p className="text-xs">Wax diiwaan xaadirin ah lama helin.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[#042954] font-bold uppercase border-b border-slate-200">
                    <th className="p-3">ID</th>
                    <th className="p-3">Magaca</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Taariikhda</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-slate-700">
                  {filteredAttendance.map((rec) => (
                    <tr key={`${rec.id}-${rec.date}-${rec.originalIndex}`} className="hover:bg-slate-50/60">
                      <td className="p-3 font-mono font-bold text-[#042954]">{rec.id}</td>
                      <td className="p-3 font-bold text-slate-900">{rec.name}</td>
                      <td className="p-3 font-semibold">{rec.form}</td>
                      <td className="p-3 font-mono text-slate-500">{rec.date}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                          rec.status === 'present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {rec.status === 'present' ? 'Jooga (Present)' : 'Maqan (Absent)'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleToggleHistoryRecord(rec.originalIndex)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Wax ka bedel Status (Badal Jooga / Maqan)"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteHistoryRecord(rec.originalIndex)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Tirtir diiwaanka"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
