import React, { useState } from 'react';
import { Schedule } from '../types';
import { Clock, Plus, Trash2, Printer, Edit3, X, Save } from 'lucide-react';

interface SchedulePageProps {
  schedules: Schedule[];
  setSchedules: (schedules: Schedule[]) => void;
  saveData: (updatedSchedules: Schedule[]) => void;
}

export default function SchedulePage({ schedules, setSchedules, saveData }: SchedulePageProps) {
  const [cls, setCls] = useState('Class 1');
  const [day, setDay] = useState('Saturday');
  const [subject, setSubject] = useState('');
  const [teacher, setTeacher] = useState('');
  const [time, setTime] = useState('');

  // Edit State
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Schedule | null>(null);

  const handleSave = () => {
    if (!subject.trim() || !teacher.trim() || !time.trim()) {
      alert("Fadlan buuxi dhammaan macluumaadka jadwalka!");
      return;
    }

    const newSlot: Schedule = {
      cls,
      day,
      sub: subject.trim(),
      tch: teacher.trim(),
      time
    };

    const updated = [...schedules, newSlot];
    setSchedules(updated);
    saveData(updated);

    // Reset
    setSubject('');
    setTeacher('');
    setTime('');

    alert("Jadwalka waa la kaydiyey!");
  };

  const handleOpenEdit = (index: number) => {
    setEditingIndex(index);
    setEditFormData({ ...schedules[index] });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIndex === null || !editFormData) return;

    const updated = schedules.map((s, idx) => idx === editingIndex ? editFormData : s);
    setSchedules(updated);
    saveData(updated);

    setEditingIndex(null);
    setEditFormData(null);
  };

  const handleDelete = (index: number) => {
    if (confirm("Ma hubtaa inaad tirtirto jadwalkan?")) {
      const updated = schedules.filter((_, idx) => idx !== index);
      setSchedules(updated);
      saveData(updated);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Schedule Input Panel */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs no-print">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold font-display text-slate-900">Xereynta Jadwalka Xiisadaha (School Schedule)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Class-ka</label>
            <select 
              value={cls}
              onChange={(e) => setCls(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors"
            >
              {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map(form => (
                <option key={form} value={form}>{form}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Maalinta</label>
            <select 
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors"
            >
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Maadada</label>
            <input 
              type="text" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Maths, English, etc." 
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Macalinka</label>
            <input 
              type="text" 
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              placeholder="Magaca Macalinka" 
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Saacadda (Time)</label>
            <input 
              type="time" 
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="mt-6 w-full bg-[#042954] hover:bg-[#032044] text-white py-3 px-4 rounded-lg font-bold text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Save Schedule</span>
        </button>
      </div>

      {/* Schedule Table Viewer */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
          <div>
            <h3 className="text-lg font-bold font-display text-slate-900">Jadwalka Iskuulka</h3>
            <p className="text-xs text-slate-500 mt-1">Liiska guud ee saacadaha casharrada xiisadaha</p>
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors shadow-sm no-print cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Schedule</span>
          </button>
        </div>

        {schedules.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Clock className="w-12 h-12 mx-auto stroke-1 mb-3" />
            <p className="text-sm">Jadwal weli lama gelin.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 text-[#042954] text-xs font-bold uppercase border-b border-slate-100">
                  <th className="p-4">Class</th>
                  <th className="p-4">Maalin</th>
                  <th className="p-4">Maadada</th>
                  <th className="p-4">Macalin</th>
                  <th className="p-4">Time</th>
                  <th className="p-4 text-center no-print">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {schedules.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-semibold text-[#042954]">{s.cls}</td>
                    <td className="p-4 font-medium text-slate-900">{s.day}</td>
                    <td className="p-4">{s.sub}</td>
                    <td className="p-4">{s.tch}</td>
                    <td className="p-4 font-mono font-bold text-amber-600">{s.time}</td>
                    <td className="p-4 text-center no-print">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => handleOpenEdit(idx)}
                          className="text-blue-600 hover:text-blue-800 hover:scale-110 transition-all p-1.5 rounded-full hover:bg-blue-50 cursor-pointer"
                          title="Wax ka bedel"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(idx)}
                          className="text-red-500 hover:text-red-700 hover:scale-110 transition-all p-1.5 rounded-full hover:bg-red-50 cursor-pointer"
                          title="Tirtir"
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

      {/* Edit Schedule Modal */}
      {editingIndex !== null && editFormData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Wax ka bedel Jadwalka</h3>
              </div>
              <button
                onClick={() => {
                  setEditingIndex(null);
                  setEditFormData(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Class-ka</label>
                <select 
                  value={editFormData.cls}
                  onChange={(e) => setEditFormData({ ...editFormData, cls: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-blue-500"
                >
                  {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map(form => (
                    <option key={form} value={form}>{form}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Maalinta</label>
                <select 
                  value={editFormData.day}
                  onChange={(e) => setEditFormData({ ...editFormData, day: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-blue-500"
                >
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Maadada</label>
                <input 
                  type="text" 
                  required
                  value={editFormData.sub}
                  onChange={(e) => setEditFormData({ ...editFormData, sub: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Macalinka</label>
                <input 
                  type="text" 
                  required
                  value={editFormData.tch}
                  onChange={(e) => setEditFormData({ ...editFormData, tch: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Saacadda (Time)</label>
                <input 
                  type="time" 
                  required
                  value={editFormData.time}
                  onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditingIndex(null);
                    setEditFormData(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Ka noqo
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#042954] hover:bg-[#031d3d] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4 text-[#ffae01]" />
                  <span>Keydi Jadwalka</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
