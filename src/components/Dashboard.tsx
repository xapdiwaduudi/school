import React, { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  Clock, 
  TrendingDown, 
  TrendingUp, 
  TrendingUpDown,
  AlertCircle 
} from 'lucide-react';
import { Student, Teacher, Expense } from '../types';

interface DashboardProps {
  students: Student[];
  teachers: Teacher[];
  expenses: Expense[];
  schoolName?: string;
}

export default function Dashboard({ students, teachers, expenses, schoolName }: DashboardProps) {
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Xisaabi lacagaha
  const collectedFees = students.reduce((sum, s) => s.feePaid ? sum + Number(s.feeAmount) : sum, 0);
  const pendingFees = students.reduce((sum, s) => !s.feePaid ? sum + Number(s.feeAmount) : sum, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amt), 0);
  const netIncome = collectedFees - totalExpenses;

  // Sizing calculations for custom bar chart (as in original script with a maximum scale)
  const maxStudents = Math.max(students.length, 1);
  const maxTeachers = Math.max(teachers.length, 1);
  const maxFees = Math.max(collectedFees, 1);

  // Normalize heights to max 150px
  const studentHeight = Math.min(students.length * 15, 150);
  const teacherHeight = Math.min(teachers.length * 30, 150);
  const feeHeight = Math.min((collectedFees / 100) * 15, 150); // Normalized scale for fees

  return (
    <div className="space-y-6">
      {/* Top Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Dashboardka Iskuulka</h1>
          <p className="text-slate-500 text-sm mt-1">Ku soo dhowow portal-ka maamulka iskuulka {schoolName || 'Xaaji Salaad School'}.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3 bg-[#042954]/5 border border-[#042954]/10 px-4 py-2.5 rounded-lg">
          <Clock className="w-5 h-5 text-[#042954] animate-pulse" />
          <div>
            <span className="text-xs text-[#042954]/60 block font-semibold uppercase tracking-wider">Saacadda Hadda</span>
            <span className="text-lg font-bold font-mono text-[#042954]">{currentTime}</span>
          </div>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Students Card */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-5 rounded-xl shadow-md flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-100">Ardayda Guud</span>
            <GraduationCap className="w-5 h-5 text-blue-100" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-display">{students.length}</span>
            <span className="text-xs text-blue-100 block mt-1">Arday firfircoon</span>
          </div>
        </div>

        {/* Total Teachers Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 rounded-xl shadow-md flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">Macalimiinta</span>
            <Users className="w-5 h-5 text-emerald-100" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-display">{teachers.length}</span>
            <span className="text-xs text-emerald-100 block mt-1">Macalimiin ka diiwaangashan</span>
          </div>
        </div>

        {/* Pending Fees Card */}
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-5 rounded-xl shadow-md flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-100">Lacagta la Sugayo</span>
            <TrendingUpDown className="w-5 h-5 text-cyan-100" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-display">${pendingFees}</span>
            <span className="text-xs text-cyan-100 block mt-1">Sugaya bixin</span>
          </div>
        </div>

        {/* Collected Fees Card */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-5 rounded-xl shadow-md flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-100">Lacagta la Qabtay</span>
            <TrendingUp className="w-5 h-5 text-amber-100" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-display">${collectedFees}</span>
            <span className="text-xs text-amber-100 block mt-1">Waa la ururiyey</span>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-gradient-to-br from-rose-500 to-red-600 text-white p-5 rounded-xl shadow-md flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-100">Kharashka Guud</span>
            <TrendingDown className="w-5 h-5 text-rose-100" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-display">${totalExpenses}</span>
            <span className="text-xs text-rose-100 block mt-1">Wadarta kharashka</span>
          </div>
        </div>

        {/* Net Income Card (Requested prominently in prompt: Net profit top) */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-5 rounded-xl shadow-md flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-100">Net Income</span>
            <span className="p-1 rounded-md bg-purple-500/30 text-white text-[10px] font-bold">Faaiido</span>
          </div>
          <div className="mt-4">
            <span className={`text-3xl font-extrabold font-display ${netIncome < 0 ? 'text-red-200' : 'text-purple-100'}`}>
              {netIncome < 0 ? '-' : ''}${Math.abs(netIncome)}
            </span>
            <span className="text-xs text-purple-100 block mt-1">Waa dakhliga saafiga ah</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics and Alert Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Custom Bar Chart Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold font-display text-slate-900 mb-1">Xaaladda Guud ee Iskuulka</h3>
            <p className="text-slate-500 text-xs mb-6">Muuqaalka garaafka ee ardayda, macalimiinta iyo dakhliga.</p>
          </div>
          
          <div className="h-64 bg-slate-50 border border-slate-100 rounded-xl flex items-end justify-around p-6 relative">
            {/* Grid helper lines */}
            <div className="absolute inset-x-0 bottom-12 border-b border-slate-200/50 pointer-events-none"></div>
            <div className="absolute inset-x-0 bottom-24 border-b border-slate-200/50 pointer-events-none"></div>
            <div className="absolute inset-x-0 bottom-36 border-b border-slate-200/50 pointer-events-none"></div>
            <div className="absolute inset-x-0 bottom-48 border-b border-slate-200/50 pointer-events-none"></div>

            {/* Students Bar */}
            <div className="flex flex-col items-center gap-2 group z-10">
              <div className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {students.length} Arday
              </div>
              <div 
                style={{ height: `${Math.max(studentHeight, 15)}px` }} 
                className="w-14 bg-gradient-to-t from-indigo-600 to-blue-500 rounded-t-lg shadow-md hover:brightness-110 transition-all duration-500 ease-out"
              ></div>
              <span className="text-xs font-semibold text-slate-600 mt-1">Arday</span>
            </div>

            {/* Teachers Bar */}
            <div className="flex flex-col items-center gap-2 group z-10">
              <div className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {teachers.length} Macalin
              </div>
              <div 
                style={{ height: `${Math.max(teacherHeight, 15)}px` }} 
                className="w-14 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg shadow-md hover:brightness-110 transition-all duration-500 ease-out"
              ></div>
              <span className="text-xs font-semibold text-slate-600 mt-1">Macalin</span>
            </div>

            {/* Collected Fees Bar */}
            <div className="flex flex-col items-center gap-2 group z-10">
              <div className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                ${collectedFees} Fees
              </div>
              <div 
                style={{ height: `${Math.max(feeHeight, 15)}px` }} 
                className="w-14 bg-gradient-to-t from-amber-500 to-yellow-400 rounded-t-lg shadow-md hover:brightness-110 transition-all duration-500 ease-out"
              ></div>
              <span className="text-xs font-semibold text-slate-600 mt-1">Fees</span>
            </div>
          </div>
        </div>

        {/* Announcements & Alert box */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold font-display text-slate-900 mb-3">Ogaysiis Degdeg ah</h3>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg space-y-2">
              <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Fadlan Xasuusnow:</span>
              </div>
              <p className="text-red-700 text-xs leading-relaxed">
                Dashboard-kani wuxuu si toos ah u xisaabinayaa xogta aad gelisid. Dhammaan macluumaadka si toos ah ayey ugu kaydsan yihiin browserkaaga.
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Sharaxaad degdeg ah</h4>
            <div className="text-xs text-slate-500 space-y-2">
              <p>• <b>Ardayda Guud:</b> Tirada guud ee ardayda la diwaangeliyay.</p>
              <p>• <b>Net Income:</b> Lacagaha la qabtay oo laga gooyay kharashaadka iskuulka.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
