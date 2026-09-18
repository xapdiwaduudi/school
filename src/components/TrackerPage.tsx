import React, { useState } from 'react';
import { Student, AttendanceRecord, ExamResult } from '../types';
import { Search, Printer, Calendar, ShieldCheck, Award } from 'lucide-react';
import UserAvatar from './UserAvatar';

interface TrackerPageProps {
  students: Student[];
  attendance: AttendanceRecord[];
  exams: ExamResult[];
  passThreshold: number;
}

export default function TrackerPage({ students, attendance, exams, passThreshold }: TrackerPageProps) {
  const [trackerId, setTrackerId] = useState('');
  const [trackedStudent, setTrackedStudent] = useState<Student | null>(null);

  const handleTrack = () => {
    if (!trackerId.trim()) {
      alert("Fadlan geli ID-ga ardayga!");
      return;
    }
    const student = students.find(s => s.id.toLowerCase() === trackerId.trim().toLowerCase());
    if (!student) {
      alert("ID-ga ardayga lama helin! Fadlan hubi ID-ga.");
      setTrackedStudent(null);
      return;
    }
    setTrackedStudent(student);
  };

  const handlePrint = () => {
    window.print();
  };

  // Compute stats if student is selected
  const presentDays = trackedStudent 
    ? attendance.filter(a => a.id.toLowerCase() === trackedStudent.id.toLowerCase() && a.status === 'present').length 
    : 0;

  const absentDays = trackedStudent 
    ? attendance.filter(a => a.id.toLowerCase() === trackedStudent.id.toLowerCase() && a.status === 'absent').length 
    : 0;

  const studentExams = trackedStudent 
    ? exams.filter(r => r.studentId.toLowerCase() === trackedStudent.id.toLowerCase()) 
    : [];

  const latestExam = studentExams.length > 0 ? studentExams[studentExams.length - 1] : null;

  // Compute pass/fail count of subjects from latest exam
  let passedSubjectsCount = 0;
  let failedSubjectsCount = 0;
  if (latestExam) {
    Object.values(latestExam.marks).forEach(mark => {
      if (mark >= passThreshold) {
        passedSubjectsCount++;
      } else {
        failedSubjectsCount++;
      }
    });
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Search Tracker Input Box */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs no-print">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-5">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold font-display text-slate-900">
              Raad-raaca Ardayga (Student Academic Tracker)
            </h2>
            <p className="text-xs text-slate-500">Xogta guud ee ardayga: Joogitaanka, Natiijada, iyo Khidmadaha</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input 
            type="text" 
            value={trackerId}
            onChange={(e) => setTrackerId(e.target.value)}
            placeholder="Student ID (tusaale: STD-001)" 
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-center font-bold outline-none focus:bg-white focus:border-[#042954] transition-colors min-h-[44px]"
          />
          <button 
            onClick={handleTrack}
            className="bg-[#042954] text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm hover:bg-[#031d3d] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs min-h-[44px]"
          >
            <span>Raadi Ardayga</span>
          </button>
        </div>
      </div>

      {/* Track Output Cards */}
      {trackedStudent && (
        <div className="space-y-4">
          <div id="tracker-print-card" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
              <UserAvatar name={trackedStudent.name} photo={trackedStudent.img} size="lg" role="student" />
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">{trackedStudent.name}</h3>
                <p className="text-xs font-semibold text-slate-500 uppercase mt-0.5">
                  ID: <strong className="text-[#042954]">{trackedStudent.id}</strong> &bull; {trackedStudent.form} ({trackedStudent.section})
                </p>
              </div>
            </div>

            {/* Bento Grid Info Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Attendance Box */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border-l-4 border-[#042954] space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                  <Calendar className="w-4 h-4 text-[#042954]" />
                  <h4>Xaaladda Xaadirinta</h4>
                </div>
                <div className="text-xs sm:text-sm text-slate-600 space-y-1">
                  <p>Maalmaha Jooga: <b className="text-emerald-600 font-extrabold">{presentDays} maalmood</b></p>
                  <p>Maalmaha Maqan: <b className="text-rose-600 font-extrabold">{absentDays} maalmood</b></p>
                </div>
              </div>

              {/* Finance box */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border-l-4 border-amber-500 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <h4>Xaaladda Maaliyadda</h4>
                </div>
                <div className="text-xs sm:text-sm text-slate-600 space-y-1">
                  <p>Lacagta Bisha: <b className="font-extrabold text-slate-800">${trackedStudent.feeAmount || 0}</b></p>
                  <p>Status: <b className={`font-black ${trackedStudent.feePaid ? 'text-emerald-600' : 'text-rose-600'}`}>{trackedStudent.feePaid ? 'PAID' : 'UNPAID'}</b></p>
                </div>
              </div>

              {/* Exams Summary span-2 */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border-l-4 border-purple-500 space-y-3 sm:col-span-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                  <Award className="w-4 h-4 text-purple-600" />
                  <h4>Natiijada Imtixaannada</h4>
                </div>

                {latestExam ? (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500 font-semibold uppercase">{latestExam.type} marks summary</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <label className="text-[10px] text-slate-400 font-bold uppercase block">Baasay</label>
                        <div className="text-emerald-600 font-black text-base sm:text-lg mt-0.5">{passedSubjectsCount}</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <label className="text-[10px] text-slate-400 font-bold uppercase block">Dhacay</label>
                        <div className="text-rose-600 font-black text-base sm:text-lg mt-0.5">{failedSubjectsCount}</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <label className="text-[10px] text-slate-400 font-bold uppercase block">Celcelis</label>
                        <div className="text-[#042954] font-black text-base sm:text-lg mt-0.5">{latestExam.average}%</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Wax imtixaan ah weli looma xereyn ardaygan.</p>
                )}
              </div>
            </div>
          </div>

          <button 
            onClick={handlePrint}
            className="w-full bg-[#042954] hover:bg-[#031d3d] text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 no-print cursor-pointer min-h-[44px]"
          >
            <Printer className="w-4 h-4 text-[#ffae01]" />
            <span>Print Student File</span>
          </button>
        </div>
      )}
    </div>
  );
}
